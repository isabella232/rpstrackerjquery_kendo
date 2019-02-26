import { BehaviorSubject } from "rxjs";

import { DashboardRepository, DashboardFilter } from "../core/services/dashboard.repository";
import { DashboardService } from "../core/services/dashboard.service";
import { StatusCounts } from "../shared/models/ui";

interface DateRange {
    dateStart: Date;
    dateEnd: Date;
}

export class DashboardPageModel {

    private dashboardRepo: DashboardRepository = new DashboardRepository();
    private dashboardService: DashboardService = new DashboardService(this.dashboardRepo);

    public filter$: BehaviorSubject<DashboardFilter> = new BehaviorSubject<DashboardFilter>({});
    public statusCounts$: BehaviorSubject<StatusCounts> = new BehaviorSubject<StatusCounts>(undefined);

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
            this.dashboardService.getStatusCounts(filter)
                .then(result => {
                    this.statusCounts$.next(result);
                });
        }
    }

}
