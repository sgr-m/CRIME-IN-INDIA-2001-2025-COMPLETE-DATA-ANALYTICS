// js/app.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // Application State
    const state = {
        activeTab: 'overview',
        filterState: 'ALL',
        datasets: {
            overview: [],
            women: [],
            police: [],
            detailedPolice: [],
            justice: []
        }
    };

    // UI Elements
    const navItems = document.querySelectorAll('.nav-item');
    const stateSelect = document.getElementById('stateFilter');
    const kpiContainer = document.getElementById('kpi-container');
    const tabTitle = document.getElementById('tab-title');
    const tabSubtitle = document.getElementById('tab-subtitle');

    // Utility: Format Numbers
    function formatNumber(num) {
        if (!num) return '0';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        // Format with commas if it's a regular large number
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function createKPI(value, label) {
        return `
            <div class="kpi-card glass-panel fade-in">
                <h3>${value}</h3>
                <p>${label}</p>
            </div>
        `;
    }

    // Load initial data
    try {
        state.datasets.overview = await window.dataLoader.loadOverviewData();
        
        // Populate Filter
        const validData = state.datasets.overview.filter(row => row.state_ut);
        const stateSet = new Set(validData.map(d => d.state_ut));
        
        Array.from(stateSet).sort().forEach(st => {
            const option = document.createElement('option');
            option.value = st;
            option.textContent = st;
            stateSelect.appendChild(option);
        });

        // Setup routing
        navItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                state.activeTab = item.dataset.tab;
                await loadAndRenderTab();
            });
        });

        stateSelect.addEventListener('change', (e) => {
            state.filterState = e.target.value;
            renderCurrentTab();
        });

        // Theme Toggle Logic
        const themeBtn = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'dark';
        
        function applyTheme(isLight) {
            if (isLight) document.body.classList.add('light-theme');
            else document.body.classList.remove('light-theme');
            
            Chart.defaults.color = isLight ? '#475569' : '#94A3B8';
            Chart.defaults.plugins.tooltip.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)';
            Chart.defaults.plugins.tooltip.titleColor = isLight ? '#0F172A' : '#F8FAFC';
            Chart.defaults.plugins.tooltip.bodyColor = isLight ? '#0F172A' : '#F8FAFC';
            Chart.defaults.plugins.tooltip.borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
        }

        if (currentTheme === 'light') applyTheme(true);

        themeBtn.addEventListener('click', () => {
            const isLight = !document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            applyTheme(isLight);
            renderCurrentTab(); // Re-render to apply new colors to charts
        });

        // Initial render
        await loadAndRenderTab();

    } catch(err) {
        console.error("Initialization error:", err);
        kpiContainer.innerHTML = `<h3 style="color:var(--accent-rose)">Error Loading Data. Ensure local HTTP server is running.</h3>`;
    }


    async function loadAndRenderTab() {
        // Fetch data if not cached
        if(state.activeTab === 'women' && state.datasets.women.length === 0) {
            state.datasets.women = await window.dataLoader.loadWomenCrimeData();
        }
        if(state.activeTab === 'police') {
            if(state.datasets.police.length === 0) {
                state.datasets.police = await window.dataLoader.loadPoliceResponseData();
            }
            if(state.datasets.detailedPolice.length === 0) {
                state.datasets.detailedPolice = await window.dataLoader.loadCrimeReportsData();
            }
        }
        if(state.activeTab === 'justice' && state.datasets.justice.length === 0) {
            state.datasets.justice = await window.dataLoader.loadJusticeData();
        }

        renderCurrentTab();
    }


    function renderCurrentTab() {
        window.dashboardCharts.destroyAll();
        kpiContainer.innerHTML = '';
        
        const filter = state.filterState;

        if (state.activeTab === 'overview') {
            tabTitle.textContent = 'Overview (2001-2025)';
            tabSubtitle.textContent = 'Comprehensive analysis of crime trends across India.';
            renderOverview(filter);
        } 
        else if (state.activeTab === 'women') {
            tabTitle.textContent = 'Crimes Against Women';
            tabSubtitle.textContent = 'Analysis of crimes specifically targeting women (2001-2023).';
            renderWomen(filter);
        }
        else if (state.activeTab === 'police') {
            tabTitle.textContent = 'Police Response';
            tabSubtitle.textContent = 'Effectiveness of police response and closure rates (2020-2024).';
            renderPolice();
        }
        else if (state.activeTab === 'justice') {
            tabTitle.textContent = 'Justice Capacity';
            tabSubtitle.textContent = 'Analysis of court infrastructure and judicial capacity (2025).';
            renderJustice();
        }
    }


    // --- RENDER LOGIC FOR TABS ---

    function renderOverview(filter) {
        let data = state.datasets.overview.filter(row => row.state_ut && row.year);
        if (filter !== 'ALL') data = data.filter(d => d.state_ut === filter);

        const totalCrimes = data.reduce((s, r) => s + (r.total_ipc_crimes || 0), 0);
        const totalStates = new Set(data.map(r => r.state_ut)).size;
        const years = [...new Set(data.map(r => r.year))].sort();

        const violent = data.reduce((s, r) => s + (r.voilent_crime_total || 0), 0);
        const property = data.reduce((s, r) => s + (r.property_crime_total || 0), 0);
        const womenCrimes = data.reduce((s, r) => s + (r.women_crime_total || 0), 0);

        // KPIs
        kpiContainer.innerHTML = `
            ${createKPI(formatNumber(totalCrimes), 'Total Crimes')}
            ${createKPI(formatNumber(totalCrimes / (years.length || 1)), 'Average Crimes')}
            ${createKPI(formatNumber(womenCrimes), 'Total Crime Against Women')}
            ${createKPI(years.length, 'Total Years Covered')}
        `;

        // Trend Chart
        const yearMap = {};
        data.forEach(r => yearMap[r.year] = (yearMap[r.year] || 0) + (r.total_ipc_crimes || 0));
        const sortedYears = Object.keys(yearMap).sort();
        window.dashboardCharts.renderTrendChart(
            sortedYears.map(y => yearMap[y]), 
            sortedYears,
            `The historical trend indicates that the total volume of IPC crimes recorded a significant trajectory over ${sortedYears.length} years.`
        );

        // Top States
        const stateMap = {};
        data.forEach(r => { stateMap[r.state_ut] = (stateMap[r.state_ut] || 0) + (r.total_ipc_crimes || 0); });
        const topStates = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
        window.dashboardCharts.renderTopStatesChart(
            topStates.map(x => x[1]), 
            topStates.map(x => x[0]), 
            'Total Cases', 
            'Top 10 States by Total IPC Crimes', 
            '#3B82F6',
            false,
            `Concentration is severe; the top state alone accounts for ${formatNumber(topStates[0] ? topStates[0][1] : 0)} cases.`
        );

        // Basis of Crimes
        const economic = data.reduce((s, r) => s + (r.economic_crime_total || 0), 0);
        window.dashboardCharts.renderDoughnutChart(
            [violent, womenCrimes, property, economic], 
            ['Violent', 'Women', 'Property', 'Economic'], 
            'Basis of Crimes',
            `Property and Violent crimes form the bulk, but economic crimes also show substantial numbers.`
        );

        // Generate Report
        document.getElementById('report-title').textContent = 'Overview Insight Report';
        document.getElementById('report-content').innerHTML = `
            Based on the selected dataset (${filter}), there have been a total of <strong>${formatNumber(totalCrimes)}</strong> IPC crimes recorded. 
            The region with the highest overall crime load is <strong>${topStates.length ? topStates[0][0] : 'N/A'}</strong> with <strong>${topStates.length ? formatNumber(topStates[0][1]) : '0'}</strong> reported incidents. 
            When analyzing the basis of crimes, Violent crimes make up a significant portion, accounting for <strong>${formatNumber(violent)}</strong> cases, while Crimes Against Women strictly account for <strong>${formatNumber(womenCrimes)}</strong> cases. The trend line indicates a need for strategic resource allocation across heavily affected states to manage the total crime load.
        `;
    }

    function renderWomen(filter) {
        let data = state.datasets.women.filter(row => row.state_ut && row.year);
        if (filter !== 'ALL') data = data.filter(d => d.state_ut === filter);

        const totalWomenCrimes = data.reduce((s, r) => s + 
            (r.rape||0) + 
            (r.dowry_deaths||0) + 
            (r.cruelty_by_husband_or_his_relatives||0) + 
            (r.assault_on_women_with_intent_to_outrage_her_modesty||0) + 
            (r.insult_to_modesty_of_women||0) +
            (r.kidnapping_and_abduction_of_women_and_girls||0) +
            (r.importation_of_girls_from_foreign_countries||0), 0);

        const totalRape = data.reduce((s, r) => s + (r.rape||0), 0);
        const custodialRape = data.reduce((s, r) => s + (r.custodial_rape||0), 0);
        const dowry = data.reduce((s, r) => s + (r.dowry_deaths||0), 0);
        const trafficking = data.reduce((s, r) => s + (r.importation_of_girls_from_foreign_countries||0), 0);

        // KPIs
        kpiContainer.innerHTML = `
            ${createKPI(formatNumber(totalWomenCrimes), 'Total Crimes Against Women')}
            ${createKPI(formatNumber(totalRape), 'Rape Cases')}
            ${createKPI(formatNumber(custodialRape), 'Custodial Rape')}
            ${createKPI(formatNumber(dowry), 'Dowry Deaths')}
            ${createKPI(formatNumber(trafficking), 'Women Trafficking')}
        `;

        const stateMap = {};
        data.forEach(r => {
            let sum = (r.rape||0) + (r.dowry_deaths||0) + (r.cruelty_by_husband_or_his_relatives||0) + 
                      (r.assault_on_women_with_intent_to_outrage_her_modesty||0) + 
                      (r.kidnapping_and_abduction_of_women_and_girls||0);
            stateMap[r.state_ut] = (stateMap[r.state_ut] || 0) + sum;
        });
        const topStates = Object.entries(stateMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
        window.dashboardCharts.renderTopStatesChart(
            topStates.map(x=>x[1]), 
            topStates.map(x=>x[0]), 
            'Crimes Against Women', 
            'Top 10 States', 
            '#F43F5E',
            true, // spanFull=true to fill grid
            `Analysis indicates disproportionate crime rates in ${topStates[0] ? topStates[0][0] : 'N/A'}, demanding targeted safety protocols.`
        );

        // Stacked Bar Chart: Crimes by Type over Years
        const crimeTypesMap = {};
        data.forEach(r => {
            const y = r.year;
            if (!crimeTypesMap[y]) crimeTypesMap[y] = {
                Rape: 0, 
                Dowry: 0, 
                Cruelty: 0, 
                Assault: 0, 
                Kidnapping: 0
            };
            crimeTypesMap[y].Rape += (r.rape||0) + (r.custodial_rape||0);
            crimeTypesMap[y].Dowry += (r.dowry_deaths||0);
            crimeTypesMap[y].Cruelty += (r.cruelty_by_husband_or_his_relatives||0);
            crimeTypesMap[y].Assault += (r.assault_on_women_with_intent_to_outrage_her_modesty||0) + (r.insult_to_modesty_of_women||0);
            crimeTypesMap[y].Kidnapping += (r.kidnapping_and_abduction_of_women_and_girls||0) + (r.importation_of_girls_from_foreign_countries||0);
        });

        const sortedYears = Object.keys(crimeTypesMap).sort();
        const datasets = [
            { label: 'Cruelty by Husband', data: sortedYears.map(y => crimeTypesMap[y].Cruelty), backgroundColor: '#F43F5E' },
            { label: 'Kidnapping', data: sortedYears.map(y => crimeTypesMap[y].Kidnapping), backgroundColor: '#F59E0B' },
            { label: 'Assault', data: sortedYears.map(y => crimeTypesMap[y].Assault), backgroundColor: '#3B82F6' },
            { label: 'Rape', data: sortedYears.map(y => crimeTypesMap[y].Rape), backgroundColor: '#10B981' },
            { label: 'Dowry Deaths', data: sortedYears.map(y => crimeTypesMap[y].Dowry), backgroundColor: '#8B5CF6' }
        ];

        window.dashboardCharts.renderStackedBarChart(
            datasets, 
            sortedYears, 
            'Crimes Against Women by Type (Year-wise)',
            `Cruelty by Husband consistently records the highest volumes, overshadowing other severe domains over the decades.`
        );

        // Generate Report
        document.getElementById('report-title').textContent = 'Crimes Against Women Insight Report';
        document.getElementById('report-content').innerHTML = `
            The timeline reveals a severe total of <strong>${formatNumber(totalWomenCrimes)}</strong> crimes committed against women. 
            Alarmingly, the highest incidence type is 'Cruelty by Husband or Relatives' which dominates the stacked yearly breakdown.
            Rape cases total <strong>${formatNumber(totalRape)}</strong> over the recorded period, highlighting significant safety vulnerabilities. 
            <strong>${topStates.length ? topStates[0][0] : 'N/A'}</strong> remains the most highly affected state with <strong>${topStates.length ? formatNumber(topStates[0][1]) : '0'}</strong> incidents, suggesting urgent intervention and specialized task forces are required.
        `;
    }

    function renderPolice() {
        const data = state.datasets.police.filter(row => row.total_cases);
        const detailed = state.datasets.detailedPolice || [];
        
        const totalCases = data.reduce((s, r) => s + (r.total_cases||0), 0);
        const avgClosure = data.reduce((s, r) => s + (r.closure_rate||0), 0) / (data.length||1);

        kpiContainer.innerHTML = `
            ${createKPI(formatNumber(totalCases), 'Total Handled Cases')}
            ${createKPI((avgClosure*100).toFixed(1) + '%', 'Avg Closure Rate')}
            ${createKPI(formatNumber(detailed.length), 'Detailed Reports')}
        `;

        // 1. Top 10 Cities by Crime Volume
        if (detailed.length > 0) {
            const cityMap = {};
            detailed.forEach(r => {
                const city = r.city || 'Unknown';
                if (city !== 'Unknown') {
                    cityMap[city] = (cityMap[city] || 0) + 1;
                }
            });
            const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
            window.dashboardCharts.renderTopStatesChart(
                topCities.map(x => x[1]), 
                topCities.map(x => x[0]), 
                'Total Cases', 
                'Top 10 Cities by Crime Volume', 
                '#3B82F6',
                true,
                `Urban environments show highly centralized case densities requiring scalable patrol presence.`
            );
        }

        // 2. Case closure by crime domain
        if (detailed.length > 0) {
            const domainMap = {};
            detailed.forEach(r => {
                const domain = r.crime_domain || 'Other';
                if (!domainMap[domain]) domainMap[domain] = { total: 0, closed: 0 };
                domainMap[domain].total++;
                if (r.case_closed === 'Yes') domainMap[domain].closed++;
            });
            const domains = Object.keys(domainMap);
            const totalCasesData = domains.map(d => domainMap[d].total);
            const closedCasesData = domains.map(d => domainMap[d].closed);
            window.dashboardCharts.renderGroupedBarChart(
                totalCasesData, closedCasesData, domains, 'Total Cases', 'Closed Cases', 'Case Closure by Crime Domain',
                `Closure efficiencies fluctuate significantly depending on the nature of the crime.`
            );
        }

        // 3. Crime by victim age group
        if (detailed.length > 0) {
            const ageMap = {};
            detailed.forEach(r => {
                const ageGroup = r.victim_age_group || 'Unknown';
                ageMap[ageGroup] = (ageMap[ageGroup] || 0) + 1;
            });
            const ageGroups = Object.keys(ageMap);
            window.dashboardCharts.renderDoughnutChart(
                ageGroups.map(a => ageMap[a]), ageGroups, 'Crime by Victim Age Group',
                `A vast majority of tracked offenses target specific adult age groups.`
            );
        }

        // 4. Impact of police deployment on case closure (Scatter plot)
        const closureScatter = data.map(r => ({
            x: r.police_deployed,
            y: r.closure_rate * 100
        }));
        window.dashboardCharts.renderScatterChart(
            closureScatter, 
            'Impact of Police Deployment on Closure Rate (%)',
            'Police Deployed',
            'Closure Rate (%)',
            false,
            `There is a visible correlation pattern between deployment strength and final closure percentages.`
        );

        // Generate Report
        document.getElementById('report-title').textContent = 'Police Response Insight Report';
        document.getElementById('report-content').innerHTML = `
            The response analysis tracks <strong>${formatNumber(totalCases)}</strong> total handled cases, maintaining a nationwide average closure rate of <strong>${(avgClosure*100).toFixed(1)}%</strong>. 
            The charts demonstrate high case concentrations in major cities, which directly correlates with the demand for <strong>Police Deployment</strong>. 
            Looking at the detailed crime domain breakdowns, property and economic crimes exhibit varying closure rates compared to violent crimes.
            The victim age group demographic indicates further needs for specialized juvenile and elder protection divisions within the active forces.
        `;
    }

    function renderJustice() {
        const data = state.datasets.justice.filter(row => row.state_ut);

        const totalJudges = data.reduce((s, r) => s + (r.working_judges||0), 0);
        const totalCourts = data.reduce((s, r) => s + (r.total_courts||0), 0);
        
        const avgVacancy = data.reduce((s, r) => s + (r.court_vacancy_rate_pct||0), 0) / (data.length||1);
        const avgJudgesPerCourt = data.reduce((s, r) => s + (r.judges_per_court||0), 0) / (data.length||1);

        kpiContainer.innerHTML = `
            ${createKPI(formatNumber(totalJudges), 'Total Judges')}
            ${createKPI(formatNumber(totalCourts), 'Total Courts')}
            ${createKPI(avgVacancy.toFixed(1) + '%', 'Avg Court Vacancy Rate')}
            ${createKPI(avgJudgesPerCourt.toFixed(2), 'Avg Judges per Court')}
        `;

        // 1. Dual axis chart
        const dualLabels = data.map(r => r.state_ut);
        window.dashboardCharts.renderDualAxisChart(
            dualLabels, 
            data.map(r => r.total_cases), 
            data.map(r => r.working_judges), 
            'Crime Load', 
            'Judicial Capacity', 
            'Justice Capacity vs Crime load (2025)',
            `The judicial capacity vastly struggles to scale alongside massive crime loads in heavily populated states.`
        );

        // 2. Average cases per district bar graph
        const casesPerDistrictData = [...data].sort((a,b) => (b.cases_per_district||0) - (a.cases_per_district||0)).slice(0, 10);
        window.dashboardCharts.renderTopStatesChart(
            casesPerDistrictData.map(r => r.cases_per_district), 
            casesPerDistrictData.map(r => r.state_ut), 
            'Avg Cases', 
            'Average Cases per District (Top 10)', 
            '#F59E0B',
            false,
            `District-level breakdowns expose localized systemic stress.`
        );

        // 3. Number of vacancies bar chart statewise
        const vacanciesData = [...data].sort((a,b) => (b.empty_courts||0) - (a.empty_courts||0)).slice(0, 10);
        window.dashboardCharts.renderTopStatesChart(
            vacanciesData.map(r => r.empty_courts), 
            vacanciesData.map(r => r.state_ut), 
            'Number of Vacancies', 
            'Number of Vacancies by State (Top 10)', 
            '#EF4444',
            false,
            `High vacancy counts present critical administrative roadblocks for efficient justice delivery.`
        );

        // Generate Report
        document.getElementById('report-title').textContent = 'Justice Capacity Insight Report';
        document.getElementById('report-content').innerHTML = `
            India currently operates with <strong>${formatNumber(totalJudges)}</strong> working judges across <strong>${formatNumber(totalCourts)}</strong> courts. 
            However, the system is severely bottlenecked with an average court vacancy rate of <strong>${avgVacancy.toFixed(1)}%</strong>. 
            This massive deficit directly impacts the crime load, as visualized in the dual-axis chart where judicial capacity strictly fails to scale linearly with the surging case volumes.
            The state of <strong>${casesPerDistrictData.length ? casesPerDistrictData[0].state_ut : 'N/A'}</strong> experiences the highest average cases per district, indicating an immediate need for rapid judicial infrastructure deployment.
        `;
    }
});
