import { Event } from '@/common/utils/event';
import { EVENT_ENUM } from '@/common/types/event';

export class ContentEventCenter {
    constructor(public ev: Event) {
        // render finished
        this.ev.on(EVENT_ENUM.HOOKS_RENDER_FINISHED, () => {
            // TODO
        });
    }
}
