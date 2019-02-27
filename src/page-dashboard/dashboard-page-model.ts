import { BehaviorSubject } from "rxjs";

import { DashboardRepository, DashboardFilter, FilteredIssues } from "../core/services/dashboard.repository";
import { DashboardService } from "../core/services/dashboard.service";
import { StatusCounts } from "../shared/models/ui";

interface DateRange {
    dateStart: Date;
    dateEnd: Date;
}

interface DataForChart {
    categories: Date[];
    itemsOpenByMonth: number[];
    itemsClosedByMonth: number[];
}

export class DashboardPageModel {

    private dashboardRepo: DashboardRepository = new DashboardRepository();
    private dashboardService: DashboardService = new DashboardService(this.dashboardRepo);

    public filter$: BehaviorSubject<DashboardFilter> = new BehaviorSubject<DashboardFilter>({});
    public statusCounts$: BehaviorSubject<StatusCounts> = new BehaviorSubject<StatusCounts>(undefined);

    public dataForChart$: BehaviorSubject<DataForChart> = new BehaviorSubject<DataForChart>(undefined);

    /*
        public categories: Date[] = [];
        public itemsOpenByMonth: number[] = [];
        public itemsClosedByMonth: number[] = [];
        */


    public onMonthRangeSelected(months: number) {
        const range = this.getDateRange(months);
        const userId = this.filter$.value ? this.filter$.value.userId ? this.filter$.value.userId : undefined : undefined;
        this.filter$.next({
            userId: userId,
            dateEnd: range.dateEnd,
            dateStart: range.dateStart
        });
        this.refresh();
    }

    private getDateRange(months: number): DateRange {
        const now = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        return {
            dateStart: start,
            dateEnd: now
        };
    }

    public refresh() {
        const filter = this.filter$.value;
        if (filter) {
            Promise.all<StatusCounts, FilteredIssues>([
                this.dashboardService.getStatusCounts(filter),
                this.dashboardService.getFilteredIssues(filter),
            ]).then(results => {
                this.statusCounts$.next(results[0]);
                this.updateStats(results[1]);
            });

            /*
            this.dashboardService.getStatusCounts(filter)
                .then(result => {
                    this.statusCounts$.next(result);
                });
                */
        }
    }

    private updateStats(issuesAll: FilteredIssues) {
        const cats = issuesAll.categories.map(c => new Date(c));
        const itemsOpenByMonth: number[] = [];
        const itemsClosedByMonth: number[] = [];
        issuesAll.items.forEach((item, index) => {
            itemsOpenByMonth.push(item.open.length);
            itemsClosedByMonth.push(item.closed.length);
        });
        this.dataForChart$.next({
            categories: cats,
            itemsOpenByMonth: itemsOpenByMonth,
            itemsClosedByMonth: itemsClosedByMonth
        });
    }
}
