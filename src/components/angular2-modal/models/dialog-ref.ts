import { ComponentRef } from '@angular/core';
import { PromiseCompleter } from '@angular/core/src/facade/promise';
import { ModalComponent } from '../models/tokens';

/**
 * API to an open modal window.
 */
export class DialogRef<T> {
    /** 
     * The reference to the component ref.
     * @internal
     * @return {ComponentRef<any>}
     */
    contentRef: ComponentRef<any>;

    /**
     * States if the modal is inside a specific element.
     */
    public inElement: boolean;
    private _resultDeferred: PromiseCompleter<any> = new PromiseCompleter<any>();

    constructor(public context?: T) { }

    /**
     * A Promise that is resolved on a close event and rejected on a dismiss event.
     * @returns {Promise<T>|any|*|Promise<any>}
     */
    get result(): Promise<any> {
        return this._resultDeferred.promise;
    }

    /**
     *  Close the modal with a return value, i.e: result.
     */
    close(result: any = null) {
        const _close = () => {
            this.destroy();
            this._resultDeferred.resolve(result);
        };
        this._fireHook<boolean>('beforeClose')
            .then( value => value !== true && _close() )
            .catch(_close);
    }

    /**
     *  Close the modal without a return value, i.e: cancelled.
     *  This call is automatically invoked when a user either:
     *  - Presses an exit keyboard key (if configured).
     *  - Clicks outside of the modal window (if configured).
     *  Usually, dismiss represent a Cancel button or a X button.
     */
    dismiss() {
        const _dismiss = () => {
            this.destroy();
            this._resultDeferred.reject();
        };
        this._fireHook<boolean>('beforeDismiss')
            .then( value => value !== true && _dismiss() )
            .catch(_dismiss);
    }

    destroy() { }

    private _fireHook<T>(name: 'beforeClose' | 'beforeDismiss'): Promise<T> {
        const instance: ModalComponent<this> = this.contentRef && this.contentRef.instance,
              fn: Function = instance && typeof instance[name] === 'function' && instance[name];

        return Promise.resolve( fn ? fn() : false );
    }
}
