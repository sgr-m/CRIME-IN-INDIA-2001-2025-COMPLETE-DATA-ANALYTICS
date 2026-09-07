from src.core_data_filtration import process_core_data
from src.supportive_filtration import process_supportive_data
from src.year2025_filtration import process_year2025_data

def main():
    print("=======================================")
    print(" CRIME IN INDIA DATA PIPELINE EXECUTION")
    print("=======================================\n")
    
    try:
        # Step 1: Core Crime Data Processing
        print(">>> STEP 1: Processing Core Crime Data (2001-2024)...")
        process_core_data()
        print(">>> STEP 1 COMPLETED.\n")
        
        # Step 2: Supportive Datasets Processing
        print(">>> STEP 2: Processing Supportive Data (Demographics & Political)...")
        process_supportive_data()
        print(">>> STEP 2 COMPLETED.\n")
        
        # Step 3: Year 2025 Monthly Data Processing
        print(">>> STEP 3: Processing Monthly Crime Data for 2025...")
        process_year2025_data()
        print(">>> STEP 3 COMPLETED.\n")
        
        print("=======================================")
        print(" ALL DATA PIPELINES EXECUTED SUCCESSFULLY")
        print("=======================================")
        
    except Exception as e:
        print("\n[ERROR] Pipeline execution failed!")
        print(f"Exception Details: {str(e)}")

if __name__ == "__main__":
    main()
