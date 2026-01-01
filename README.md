# CRIME IN INDIA: TEMPORAL TRENDS, SPATIAL PATTERNS, AND INSTITUTIONAL CONTEXT (2001–2025)

## Overview
This repository contains the source code and analytical workflow supporting a research study on crime trends in India over the period 2001–2025.

The work focuses on temporal patterns, spatial distribution, and institutional contextual analysis using publicly available and secondary datasets.

This repository is intended to support transparency, reproducibility, and methodological clarity. Final interpretations and conclusions are presented in the associated research publication.

---

## Data Sources
The analysis is based on officially published and secondary datasets, including:
- National Crime Records Bureau (NCRB) publications
- Census and demographic indicators
- Administrative and institutional datasets
- GeoJSON shapefiles for Indian states and union territories

⚠️ **Raw datasets are not included in this repository** due to data usage restrictions and ethical considerations.  
Only processed and aggregated data suitable for reproducibility are shared.

---

## Methodology
The research methodology involves:
1. Data cleaning and preprocessing
2. Exploratory Data Analysis (EDA)
3. Temporal trend analysis (year-wise and period-wise)
4. Spatial analysis using GIS-based mapping
5. Statistical modeling and interpretation
6. Visualization using Python libraries and Power BI

---

## Repository Structure
```
CRIME-IN-INDIA-2001-2025/
├── assets/                  # Figures, images, supplementary files
├── figures/                 # Generated plots, charts
├── notebooks/               # Jupyter notebooks
│   ├── Filtereddata/        # Processed datasets for reproducibility
│   │   └── FilteredData/
│   └── geojson_states/      # GeoJSON files for Indian states
├── powerbi/                 # Power BI dashboards and PBIX files
└── README.md                # This file
```
---

## Reproducibility
To reproduce the analysis:
1. Clone this repository
2. Install required Python libraries
3. Run the Jupyter notebooks in logical sequence

Detailed dependency information will be provided in `requirements.txt`.

---

## Ethical Considerations
- No individual-level or personally identifiable information is used
- Data is analyzed at aggregated temporal and spatial levels
- The study adheres to ethical research practices in crime analysis

---

## Authors

**Sagar Maindola**  
Assistant Professor & PGT Computer Science / IP  
Researcher – Data Science Engineering  

**Prerna Doodraj**  
PGT Political Science  
Researcher – Political Science & Institutional Analysis

---

## Citation
If you use this code, please cite the associated research paper once published.
