import "bootstrap/dist/css/bootstrap.css";
import '@progress/kendo-ui/css/web/kendo.default-v2.min.css';
import '../styles.css';
import './active-issues.css';

import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import '@progress/kendo-ui/js/kendo.buttongroup';
import '@progress/kendo-ui/js/kendo.dataviz.chart';

import { DashboardPageModel } from './dashboard-page-model';

const dashboardPageModel = new DashboardPageModel();

dashboardPageModel.filter$.subscribe(filter => {
    if (filter && filter.dateStart && filter.dateEnd) {
        const range = `${filter.dateStart.toDateString()} - ${filter.dateEnd.toDateString()}`;
        $('#spanFilteredDateRange').html(range);
    }
});

dashboardPageModel.statusCounts$.subscribe(results => {
    if (results) {
        $('#statusCountsActiveItemsCount').text(results.activeItemsCount);
        $('#statusCountsClosedItemsCount').text(results.closedItemsCount);
        $('#statusCountsOpenItemsCount').text(results.openItemsCount);
        $('#statusCountsCloseRate').text(`${Math.floor(results.closeRate * 100) / 100}%`);
    }
});

dashboardPageModel.dataForChart$.subscribe(data => {
    if (data) {
        $("#chart").kendoChart({
            title: 'All Issues',
            categoryAxis: {
                categories: data.categories,
                baseUnit: 'months',
                majorGridLines: { visible: false },
                labels: { rotation: 'auto' }
            },
            seriesDefaults: {
                gap: 0.06,
                stack: true,
                type: 'column'
            },
            series: [
                {
                    name: 'Open',
                    data: data.itemsOpenByMonth,
                    color: '#CC3458',
                    opacity: 0.7
                },
                {
                    name: 'Closed',
                    data: data.itemsClosedByMonth,
                    color: '#35C473',
                    opacity: 0.7
                },
            ],
            legend: {
                position: 'bottom'
            },
            theme: 'sass'

        });
    }
});


$(() => {
    $('.btn-group').kendoButtonGroup();
    $('.pt-class-range-filter')
        //.kendoButton()
        .click((e) => {
            const range = Number($(e.currentTarget).attr('data-range'));
            dashboardPageModel.onMonthRangeSelected(range);
        });
});

dashboardPageModel.refresh();

