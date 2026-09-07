import os
import pandas as pd
import numpy as np

def process_core_data():
    print("Starting Core Data Filtration...")
    
    # https://www.kaggle.com/datasets/umeshchandra789/crimes-in-india
    # loading the dataset
    crimes_in_india = pd.read_csv('notebooks/Raw Datasets/Crime Datasets/crimes_in_india_2001_2023.csv')

    # attribute information:
    print("Crimes in India Info:")
    crimes_in_india.info()

    crimes_in_india['state_ut'] = (
        crimes_in_india['state_ut']
        .str.upper()
        .str.replace('&', 'AND', regex=False)
        .str.replace(r'\s+', ' ', regex=True)
        .str.strip()
    )

    # applying precise mapping
    state_mapping = {
        'A AND N ISLANDS': 'ANDAMAN AND NICOBAR ISLANDS',
        'D AND N HAVELI': 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
        'DAMAN AND DIU': 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
        'DELHI UT': 'DELHI',
        'JAMMU AND KASHMIR': 'JAMMU AND KASHMIR'
    }

    crimes_in_india['state_ut'] = crimes_in_india['state_ut'].replace(state_mapping)

    # A. Standardize Identifiers
    crimes_in_india['state_ut'] = crimes_in_india['state_ut'].str.upper().str.strip()
    crimes_in_india['destrict'] = crimes_in_india['district'].str.upper().str.strip()

    # B. Sort for Time-Series Consistency
    crimes_in_india = crimes_in_india.sort_values(['state_ut', 'district', 'year'])

    violent_crimes = [
        'murder', 'attempt_to_murder', 'culpable_homicide_not_amounting_to_murder',
        'rape', 'riots', 'hurt_grievous_hurt', 'dowry_deaths', 'causing_death_by_negligence'
    ]

    women_crimes = [
        'rape', 'custodial_rape', 'other_rape', 'kidnapping_and_abduction_of_women_and_girls',
        'dowry_deaths', 'assault_on_women_with_intent_to_outrage_her_modesty',
        'insult_to_modesty_of_women', 'cruelty_by_husband_or_his_relatives',
        'importation_of_girls_from_foreign_countries'
    ]

    property_crimes = [
        'dacoity', 'preparation_and_assembly_for_dacoity', 'robbery',
        'burglary', 'theft', 'auto_theft', 'other_theft'
    ]

    economic_crimes = [
        'criminal_breach_of_trust', 'cheating', 'counterfeiting'
    ]

    crimes_in_india['voilent_crime_total'] = crimes_in_india[violent_crimes].sum(axis=1)
    crimes_in_india['women_crime_total'] = crimes_in_india[women_crimes].sum(axis=1)
    crimes_in_india['property_crime_total'] = crimes_in_india[property_crimes].sum(axis=1)
    crimes_in_india['economic_crime_total'] = crimes_in_india[economic_crimes].sum(axis=1)

    os.makedirs('FilteredData', exist_ok=True)
    # Exporting the dataframe in New CSV File
    crimes_in_india.to_csv('notebooks/FilteredData/crimes_in_india_2001_2023_filtered.csv', index=False)

    district_year_level = crimes_in_india[
        ['state_ut', 'district', 'year',
         'voilent_crime_total', 'women_crime_total',
         'property_crime_total', 'economic_crime_total',
         'total_ipc_crimes']
    ]

    state_year = (
        crimes_in_india.groupby(['state_ut', 'year'], as_index=False)
          .agg({
              'voilent_crime_total': 'sum',
              'women_crime_total': 'sum',
              'property_crime_total': 'sum',
              'economic_crime_total': 'sum',
              'total_ipc_crimes': 'sum'
          })
    )

    crime_against_women = crimes_in_india[['state_ut', 'district', 'year'] + women_crimes]

    state_year.to_csv('notebooks/FilteredData/crime_state_year.csv', index=False)
    district_year_level.to_csv('notebooks/FilteredData/crime_district_year.csv', index=False)
    crime_against_women.to_csv('notebooks/FilteredData/crime_against_women.csv', index=False)

    # 2020-2024 Crime Reports
    crime_df_2024 = pd.read_csv("notebooks/Raw Datasets/Crime Datasets/crime_dataset_india_2020-2024.csv")
    
    # renaming the columns for clean code
    crime_df_2024.columns = crime_df_2024.columns.str.lower().str.replace(' ', '_')

    date_cols = ['date_reported', 'date_of_occurrence', 'date_case_closed']
    for col in date_cols:
        crime_df_2024[col] = pd.to_datetime(crime_df_2024[col], errors='coerce')

    # filling NaN value for attribute: weapon_used -> UNKNOWN
    crime_df_2024['weapon_used'] = crime_df_2024['weapon_used'].fillna('UNKNOWN')

    crime_df_2024['case_closed_flag'] = crime_df_2024['case_closed'].map({'Yes': 1, 'No': 0})
    # Yes matlab 1 and No matlab 0 simple

    crime_df_2024['case_resolution_days'] = (
        crime_df_2024['date_case_closed'] - crime_df_2024['date_reported']
    ).dt.days

    crime_df_2024['victim_age_group'] = pd.cut(
        crime_df_2024['victim_age'],
        bins=[0, 17, 30, 45, 60, 100],
        labels=['Minor', 'Young Adult', 'Adult', 'Middle Aged', 'Senior']
    )

    os.makedirs('notebooks/FilteredData/2020_to_2024', exist_ok=True)
    crime_df_2024.to_csv('notebooks/FilteredData/2020_to_2024/crime_reports_2020_2024.csv', index=False)

    normalized_crime_reports_2020_2024 = crime_df_2024[
        ['report_number', 'date_reported', 'date_of_occurrence',
         'city', 'crime_domain', 'crime_description',
         'victim_age', 'victim_age_group', 'victim_gender',
         'weapon_used', 'police_deployed',
         'case_closed_flag', 'case_resolution_days']
    ]
    normalized_crime_reports_2020_2024.to_csv('notebooks/FilteredData/2020_to_2024/normalized_crime_reports_2020_2024.csv', index=False)

    df_women_incidents = crime_df_2024[crime_df_2024['victim_gender'] == 'F']
    df_women_incidents.to_csv('notebooks/FilteredData/2020_to_2024/crime_against_women_2020_2024.csv', index=False)

    df_weapon_crimes = crime_df_2024.groupby('weapon_used', as_index=False).agg(total_cases=('report_number', 'count'))
    df_weapon_crimes.to_csv('notebooks/FilteredData/2020_to_2024/weapon_based_crime_2020_2024.csv', index=False)

    df_police_effect = crime_df_2024.groupby('police_deployed', as_index=False).agg(
        total_cases=('report_number', 'count'), 
        closure_rate=('case_closed_flag', 'mean')
    )
    df_police_effect.to_csv('notebooks/FilteredData/2020_to_2024/Police_Response_Effectiveness_2020-2024.csv', index=False)

    # NCRB Table IPC Crimes 2020-2022
    ncrb_table_ipc_crimes = pd.read_csv('notebooks/Raw Datasets/Crime Datasets/NCRB_Table_1A.1.csv')
    ncrb = ncrb_table_ipc_crimes.copy()

    ncrb.columns = [
        'sl_no', 'state_ut', 'crimes_2020', 'crimes_2021', 'crimes_2022',
        'population_lakhs_2022', 'crime_rate_2022', 'chargesheeting_rate_2022'
    ]
    ncrb['state_ut'] = ncrb['state_ut'].str.upper().str.strip()

    ncrb['growth_20_21_pct'] = ((ncrb['crimes_2021'] - ncrb['crimes_2020']) / ncrb['crimes_2020']) * 100
    ncrb['growth_21_22_pct'] = ((ncrb['crimes_2022'] - ncrb['crimes_2021']) / ncrb['crimes_2021']) * 100
    ncrb['avg_crimes_2020_22'] = ncrb[['crimes_2020','crimes_2021','crimes_2022']].mean(axis=1)
    
    # lakh -> million (1m = 10 Lakh)
    ncrb['population_million_2022'] = ncrb['population_lakhs_2022'] / 10
    ncrb['crime_per_million_2022'] = ncrb['crimes_2022'] / ncrb['population_million_2022']

    ncrb.to_csv("notebooks/FilteredData/ncrb_state_wise_ipc_summary_2020_2022.csv", index=False)

    # Court Judge Count Report 2025
    judge_count = pd.read_excel("notebooks/Raw Datasets/Crime Datasets/court_judge_count_report 2025.xlsx")
    judges = judge_count.copy()

    judges.columns = [
        'sr_no', 'state_ut', 'working_judges', 'incharge_courts', 'link_courts',
        'total_courts', 'empty_courts', 'invalid_jocode_count', 'courts_closed_cases_pending'
    ]
    judges['state_ut'] = judges['state_ut'].str.upper().str.strip()

    judges['court_vacancy_rate_pct'] = (judges['empty_courts'] / judges['total_courts']) * 100
    judges['judges_per_court'] = (judges['working_judges'] / judges['total_courts'])
    judges['temporary_court_ratio_pct'] = ((judges['incharge_courts'] + judges['link_courts']) / judges['total_courts']) * 100

    judges.to_csv('notebooks/FilteredData/courts_judge_count_report_2025.csv', index=False)

    # Summary Report on Courts 2025
    summary_report_on_courts = pd.read_excel("notebooks/Raw Datasets/Crime Datasets/Summary_Report_on_Courts_2025.xlsx")
    courts = summary_report_on_courts.copy()

    courts.columns = [
        'sr_no', 'state_ut', 'total_districts', 'court_complexes', 'total_establishments',
        'total_cases_db', 'total_orders', 'orders_not_uploaded'
    ]
    courts['state_ut'] = courts['state_ut'].str.upper().str.strip()

    courts['cases_per_establishment'] = courts['total_cases_db'] / courts['total_establishments']
    courts['orders_per_establishment'] = courts['total_orders'] / courts['total_establishments']
    courts['orders_not_uploaded_pct'] = (courts['orders_not_uploaded'] / courts['total_orders']) * 100
    courts['cases_per_district'] = courts['total_cases_db'] / courts['total_districts']

    justice_capacity = judges.merge(courts, on='state_ut', how='inner')
    justice_capacity.to_csv('notebooks/FilteredData/justice_capacity_in_India_2025.csv', index=False)

    print("Core Data Filtration Completed.")
