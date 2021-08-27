import { EVENT_ENUM } from '@/common/types/event';
import { getNonce } from '@/common/utils/functions';
import { Webview } from 'vscode';

type Cbfn = (value: any) => void;
type Eventfn = (data: any, cb?: Cbfn) => void;
type MessageType = { type: EVENT_ENUM; data?: any; eventId: string };

export class Event {
    constructor(public reciver: any, public emitter: any) {
        this.reciver(({ type, data, eventId }: MessageType) => {
            if (this.callbackMap[eventId]) {
                this.callbackMap[eventId].call(this, data);
            } else {
                this.eventCenter[type]?.call(this, data, (callValue: any) => {
                    this.emit({
                        type,
                        data: callValue,
                        eventId,
                    });
                });
            }
        });
    }

    private callbackMap: any = {};
    private eventCenter: Partial<Record<EVENT_ENUM, Eventfn>> = {};

    public emit(config: {
        type: EVENT_ENUM;
        data?: any;
        eventId?: string;
        callback?: Cbfn;
    }) {
        let eventId = config.eventId ?? getNonce() + Date.now();
        if (config.callback) {
            this.callbackMap[eventId] = config.callback;
        }
        return this.emitter({
            type: config.type,
            data: config.data,
            eventId,
        });
    }

    public on(type: EVENT_ENUM, fn?: Eventfn) {
        this.eventCenter[type] = fn;
    }
}
