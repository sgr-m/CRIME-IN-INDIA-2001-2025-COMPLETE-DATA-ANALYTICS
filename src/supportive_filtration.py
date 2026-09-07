import pandas as pd
import os

def process_supportive_data():
    print("Starting Supportive Data Filtration...")
    
    # https://en.wikipedia.org/wiki/List_of_current_Indian_chief_ministers
    ruling_party = pd.read_csv('notebooks/Raw Datasets/Supportive Datasets/STATEWISE_RULING_PARTY.CSV')
    ruling_party.fillna("Unknown", inplace=True)
    
    ruling_party_expanded = ruling_party.melt(
        id_vars=['State'], 
        var_name='Year', 
        value_name='Ruling_Party'
    )
    
    # https://censusindia.gov.in/nada/index.php/catalog/11361
    comm_wise_population = pd.read_csv('notebooks/Raw Datasets/Supportive Datasets/COMMUNITYWISE POPULATION - DDW00C-01 MDDS converted.csv')
    
    # keeping total columns
    state_total = comm_wise_population[
        comm_wise_population['total_rural_urban'].str.strip().str.lower() == 'total'
    ].copy()

    state_total = state_total[
        [
            'state_code', 'area_name', 'total_persons',
            'total_hindu', 'total_muslim', 'total_christian',
            'total_sikh', 'total_buddhist', 'total_jain',
            'total_others', 'no_religion_total'
        ]
    ]

    religion_cols = [
        'total_hindu', 'total_muslim', 'total_christian',
        'total_sikh', 'total_buddhist', 'total_jain',
        'total_others', 'no_religion_total'
    ]

    for col in religion_cols:
        state_total[col.replace('total_', '') + '_percent'] = (
            state_total[col] / state_total['total_persons'] * 100
        )

    # dropping row count
    state_comm_percent = state_total.drop(columns=religion_cols)

    os.makedirs('FilteredData', exist_ok=True)
    state_comm_percent.to_csv("notebooks/FilteredData/census_2011_religionwise_population.csv", index=False)
    ruling_party_expanded.to_csv('notebooks/FilteredData/ruling_party_expanded.csv', index=False)

    print("Supportive Data Filtration Completed.")
