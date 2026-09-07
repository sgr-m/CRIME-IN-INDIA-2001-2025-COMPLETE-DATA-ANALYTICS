// js/dataLoader.js

class DataLoader {
    constructor() {
        this.cache = {};
        this.basePath = '../notebooks/FilteredData/';
    }

    async fetchCSV(path) {
        const url = this.basePath + path;
        if (this.cache[url]) {
            return this.cache[url];
        }

        return new Promise((resolve, reject) => {
            Papa.parse(url, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.cache[url] = results.data;
                    resolve(results.data);
                },
                error: (error) => {
                    console.error(`Error parsing CSV (${url}):`, error);
                    reject(error);
                }
            });
        });
    }

    async loadOverviewData() {
        return await this.fetchCSV('crime_state_year.csv');
    }

    async loadWomenCrimeData() {
        return await this.fetchCSV('crime_against_women.csv');
    }

    async loadPoliceResponseData() {
        return await this.fetchCSV('2020_to_2024/Police_Response_Effectiveness_2020_2024.csv');
    }

    async loadCrimeReportsData() {
        return await this.fetchCSV('2020_to_2024/crime_reports_2020_2024.csv');
    }

    async loadJusticeData() {
        return await this.fetchCSV('justice_capacity_in_India_2025.csv');
    }
}

window.dataLoader = new DataLoader();
