// js/charts.js

Chart.register(ChartDataLabels);

Chart.defaults.color = '#94A3B8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#F8FAFC';
Chart.defaults.plugins.tooltip.bodyColor = '#F8FAFC';
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;

// Configure global datalabels defaults
Chart.defaults.plugins.datalabels.display = false; // Off by default, enabled per chart
Chart.defaults.plugins.datalabels.color = function(context) { return Chart.defaults.color; };
Chart.defaults.plugins.datalabels.font = { weight: 'bold', size: 10 };

class DashboardCharts {
    constructor() {
        this.activeCharts = [];
        this.chartIdCounter = 0;
    }

    destroyAll() {
        this.activeCharts.forEach(chart => chart.destroy());
        this.activeCharts = [];
        const container = document.getElementById('chart-container');
        if (container) container.innerHTML = '';
        this.chartIdCounter = 0;
    }

    createChartCard(title, spanFull = false, insightText = '') {
        const card = document.createElement('div');
        card.className = `chart-card glass-panel fade-in ${spanFull ? 'span-2' : ''}`;
        
        card.innerHTML = `
            <h3>${title}</h3>
            ${insightText ? `<p class="chart-insight" style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.4;">${insightText}</p>` : ''}
            <div class="chart-body">
                <canvas></canvas>
            </div>
        `;
        document.getElementById('chart-container').appendChild(card);
        return card.querySelector('canvas').getContext('2d');
    }

    formatYAxis(value) {
        return value >= 1e6 ? (value/1e6).toFixed(1) + 'M' : 
               value >= 1e3 ? (value/1e3).toFixed(1) + 'K' : value;
    }

    // --- SHARED CHARTS ---
    renderTrendChart(data, labels, insightText = '') {
        const ctx = this.createChartCard('Total Crimes Over Time', true, insightText);
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total IPC Crimes',
                    data: data,
                    borderColor: '#3B82F6',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#0A0F1C',
                    pointBorderColor: '#3B82F6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { 
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { callback: this.formatYAxis }
                    }
                }
            }
        });
        this.activeCharts.push(chart);
    }

    renderTopStatesChart(data, labels, xAxisLabel = 'Total Cases', title = 'Top 10 States', color = '#3B82F6', spanFull = false, insightText = '') {
        const ctx = this.createChartCard(title, spanFull, insightText);
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: xAxisLabel,
                    data: data,
                    backgroundColor: color,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        align: 'right',
                        anchor: 'end',
                        formatter: (value) => this.formatYAxis(value)
                    }
                },
                scales: {
                    x: { 
                        grid: { color: 'rgba(150, 150, 150, 0.1)' },
                        ticks: { callback: this.formatYAxis },
                        suggestedMax: Math.max(...data) * 1.15
                    },
                    y: { grid: { display: false } }
                }
            }
        });
        this.activeCharts.push(chart);
    }

    renderDoughnutChart(data, labels, title, insightText = '', colors = ['#3B82F6', '#F43F5E', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4']) {
        const ctx = this.createChartCard(title, false, insightText);
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                layout: { padding: 40 },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                    datalabels: { 
                        display: true,
                        color: function() { return Chart.defaults.color; },
                        anchor: 'end',
                        align: 'end',
                        offset: 10,
                        formatter: (value, context) => {
                            const label = context.chart.data.labels[context.dataIndex];
                            return `${label}\n${this.formatYAxis(value)}`;
                        },
                        textAlign: 'center',
                        font: { size: 11, weight: 'bold' }
                    }
                }
            }
        });
        this.activeCharts.push(chart);
    }

    renderGroupedBarChart(data1, data2, labels, label1, label2, title, insightText = '') {
        const ctx = this.createChartCard(title, true, insightText);
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label1,
                        data: data1,
                        backgroundColor: '#3B82F6',
                        borderRadius: 4
                    },
                    {
                        label: label2,
                        data: data2,
                        backgroundColor: '#10B981',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top' },
                    datalabels: {
                        display: true,
                        align: 'end',
                        anchor: 'end',
                        formatter: (value) => this.formatYAxis(value)
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { 
                        grid: { color: 'rgba(150, 150, 150, 0.1)' },
                        ticks: { callback: this.formatYAxis },
                        suggestedMax: Math.max(...data1, ...data2) * 1.15
                    }
                }
            }
        });
        this.activeCharts.push(chart);
    }

    renderStackedBarChart(datasets, labels, title, insightText = '') {
        const ctx = this.createChartCard(title, true, insightText);
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top' },
                    datalabels: {
                        display: function(context) {
                            return context.datasetIndex === context.chart.data.datasets.length - 1; // Only display on top stack
                        },
                        align: 'end',
                        anchor: 'end',
                        formatter: (value, context) => {
                            let sum = 0;
                            context.chart.data.datasets.forEach(dataset => {
                                sum += dataset.data[context.dataIndex];
                            });
                            return sum > 0 ? this.formatYAxis(sum) : '';
                        },
                        color: function() { return Chart.defaults.color; },
                        font: { weight: 'bold' }
                    }
                },
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { 
                        stacked: true,
                        grid: { color: 'rgba(150, 150, 150, 0.1)' },
                        ticks: { callback: this.formatYAxis },
                        suggestedMax: Math.max(...labels.map((_, i) => datasets.reduce((sum, ds) => sum + ds.data[i], 0))) * 1.15
                    }
                }
            }
        });
        this.activeCharts.push(chart);
    }

    // --- POLICE & JUSTICE CHARTS ---
    renderScatterChart(data, title, xAxisLabel = 'X Axis', yAxisLabel = 'Y Axis', spanFull = false, insightText = '') {
        const ctx = this.createChartCard(title, spanFull, insightText);
        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: '#3B82F6',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, datalabels: { display: false } },
                scales: {
                    x: { 
                        grid: { color: 'rgba(150, 150, 150, 0.1)' },
                        title: { display: true, text: xAxisLabel, color: Chart.defaults.color }
                    },
                    y: { 
                        grid: { color: 'rgba(150, 150, 150, 0.1)' },
                        title: { display: true, text: yAxisLabel, color: Chart.defaults.color }
                    }
                }
            }
        });
        this.activeCharts.push(chart);
    }

    renderDualAxisChart(labels, data1, data2, label1, label2, title, insightText = '') {
        const ctx = this.createChartCard(title, true, insightText);
        
        // Gradient for data1 (Crime Load)
        let gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
        gradient1.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
        gradient1.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

        // Gradient for data2 (Judicial Capacity)
        let gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
        gradient2.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient2.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label1,
                        data: data1,
                        borderColor: '#F43F5E',
                        backgroundColor: gradient1,
                        borderWidth: 2,
                        pointBackgroundColor: '#0A0F1C',
                        pointBorderColor: '#F43F5E',
                        pointRadius: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: label2,
                        data: data2,
                        borderColor: '#3B82F6',
                        backgroundColor: gradient2,
                        borderWidth: 2,
                        pointBackgroundColor: '#0A0F1C',
                        pointBorderColor: '#3B82F6',
                        pointRadius: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top' }, datalabels: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: {maxRotation: 45, minRotation: 45} },
                    y: { 
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: 'rgba(150, 150, 150, 0.1)' },
                        ticks: { callback: this.formatYAxis },
                        title: { display: true, text: label1, color: '#F43F5E' }
                    },
                    y1: { 
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { callback: this.formatYAxis },
                        title: { display: true, text: label2, color: '#3B82F6' }
                    }
                }
            }
        });
        this.activeCharts.push(chart);
    }
}

window.dashboardCharts = new DashboardCharts();
