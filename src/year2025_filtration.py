import pandas as pd
import os

def process_year2025_data():
    print("Starting Year 2025 Data Filtration...")
    
    base_path = 'notebooks/Raw Datasets/Crime Datasets/CRIME REVIEW FOR YEAR 2025/'
    
    file_mapping = [
        ('JANUARY 2025 datafile.csv', '2025-01'),
        ('FEB 2025 datafile.csv', '2025-02'),
        ('MARCH 2025 datafile.csv', '2025-03'),
        ('APRIL 2025 datafile.csv', '2025-04'),
        ('MAY 2025 datafile.csv', '2025-05'),
        ('JUNE 2025 datafile.csv', '2025-06'),
        ('JULY 2025 datafile.csv', '2025-07'),
        ('AUGUST 2025 datafile.csv', '2025-08'),
        ('SEPT 2025 datafile.csv', '2025-09'),
        ('OCTOBER 2025 IPC.csv', '2025-10')
    ]
    
    monthly_dfs = []
    
    for filename, month_tag in file_mapping:
        df = pd.read_csv(os.path.join(base_path, filename))
        
        # Removing All Unnamed Columns (handles Unnamed: 8 or any other)
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
        
        df.columns = [
            'sl_no',
            'crime_head',
            'major_head',
            'minor_head',
            'ytd_current_year',
            'ytd_previous_year',
            'previous_month',
            'current_month'
        ]
        
        if month_tag == '2025-08':
            # handling missing values specifically for august:
            df['crime_head'] = df['crime_head'].fillna('TOTAL / NOT SPECIFIED')
            
        df['minor_head'] = df['minor_head'].fillna('ALL / NOT SPECIFIED')
        
        numeric_cols = [
            'ytd_current_year',
            'ytd_previous_year',
            'previous_month',
            'current_month'
        ]
        
        df[numeric_cols] = df[numeric_cols].fillna(0)
        df[numeric_cols] = df[numeric_cols].astype(int)
        
        df['month'] = month_tag
        monthly_dfs.append(df)
        
    crime_2025_master = pd.concat(monthly_dfs, ignore_index=True)
    
    num_cols = [
        'ytd_current_year',
        'ytd_previous_year',
        'previous_month',
        'current_month'
    ]
    crime_2025_master[num_cols] = crime_2025_master[num_cols].astype(int)
    
    # cy-py
    crime_2025_master['mom_change'] = (
        crime_2025_master['current_month'] -
        crime_2025_master['previous_month']
    )
    
    # Growth = [(cy-py)/py]*100 
    crime_2025_master['mom_growth_pct'] = (
        crime_2025_master['mom_change'] /
        crime_2025_master['previous_month'].replace(0, 1)
    ) * 100
    
    monthly_trend = (
        crime_2025_master.groupby('month')['current_month'].sum().reset_index()
    )
    
    major_head_trend = (
        crime_2025_master.groupby(['month', 'major_head'])['current_month'].sum().reset_index()
    )
    
    os.makedirs('notebooks/FilteredData/Year_2025_Month_Wise', exist_ok=True)
    crime_2025_master.to_csv("notebooks/FilteredData/Year_2025_Month_Wise/crime_2025_master(combined).csv", index=False)
    
    print("Year 2025 Data Filtration Completed.")
