// Base EventEmitter interface that will work on both server and client
interface IEventEmitter {
    on(event: string, fn: Function, context?: any): this;
    once(event: string, fn: Function, context?: any): this;
    emit(event: string, ...args: any[]): boolean;
    removeListener(event: string, fn?: Function, context?: any, once?: boolean): this;
    off(event: string, fn?: Function, context?: any, once?: boolean): this;
    removeAllListeners(event?: string): this;
}

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Create a simple mock EventEmitter for server-side rendering
class ServerEventEmitter implements IEventEmitter {
    on(event: string, fn: Function, context?: any): this {
        // No-op on server
        return this;
    }
    
    once(event: string, fn: Function, context?: any): this {
        // No-op on server
        return this;
    }
    
    emit(event: string, ...args: any[]): boolean {
        // No-op on server
        return false;
    }
    
    removeListener(event: string, fn?: Function, context?: any, once?: boolean): this {
        // No-op on server
        return this;
    }
    
    off(event: string, fn?: Function, context?: any, once?: boolean): this {
        // No-op on server
        return this;
    }
    
    removeAllListeners(event?: string): this {
        // No-op on server
        return this;
    }
}

// Enhanced EventEmitter that tracks listeners (client-side only)
class EnhancedEventEmitter implements IEventEmitter {
    private emitter: Phaser.Events.EventEmitter;
    private listenerTracker: Map<string, Set<Function>>;
    
    constructor() {
        // Only import Phaser when we're on the client
        const Phaser = require('phaser');
        this.emitter = new Phaser.Events.EventEmitter();
        this.listenerTracker = new Map();
    }
    
    private trackListener(event: string, fn: Function): void {
        if (!this.listenerTracker.has(event)) {
            this.listenerTracker.set(event, new Set());
        }
        this.listenerTracker.get(event)?.add(fn);
    }
    
    private untrackListener(event: string, fn?: Function): void {
        if (!fn) {
            // If no function provided, remove all for this event
            this.listenerTracker.delete(event);
            return;
        }
        
        const eventListeners = this.listenerTracker.get(event);
        if (eventListeners) {
            eventListeners.delete(fn);
            if (eventListeners.size === 0) {
                this.listenerTracker.delete(event);
            }
        }
    }
    
    on(event: string, fn: Function, context?: any): this {
        this.emitter.on(event, fn, context);
        this.trackListener(event, fn);
        return this;
    }
    
    once(event: string, fn: Function, context?: any): this {
        // Wrap the function to untrack when it's called
        const wrappedFn = (...args: any[]) => {
            fn(...args);
            this.untrackListener(event, wrappedFn);
        };
        
        this.emitter.once(event, wrappedFn, context);
        this.trackListener(event, wrappedFn);
        return this;
    }
    
    emit(event: string, ...args: any[]): boolean {
        return this.emitter.emit(event, ...args);
    }
    
    removeListener(event: string, fn?: Function, context?: any, once?: boolean): this {
        this.emitter.removeListener(event, fn, context, once);
        this.untrackListener(event, fn);
        return this;
    }
    
    off(event: string, fn?: Function, context?: any, once?: boolean): this {
        return this.removeListener(event, fn, context, once);
    }
    
    removeAllListeners(event?: string): this {
        if (event) {
            this.emitter.removeAllListeners(event);
            this.listenerTracker.delete(event);
        } else {
            this.emitter.removeAllListeners();
            this.listenerTracker.clear();
        }
        return this;
    }
    
    // Get all event names that have active listeners
    getActiveEvents(): string[] {
        return Array.from(this.listenerTracker.keys());
    }
    
    // Get the count of listeners for a specific event
    getListenerCount(event: string): number {
        return this.listenerTracker.get(event)?.size || 0;
    }
    
    // Debug method to log all active listeners
    debugListeners(): void {
        console.log('Active listeners:');
        this.listenerTracker.forEach((listeners, event) => {
            console.log(`Event: ${event}, Listeners: ${listeners.size}`);
        });
    }
}

// Export the appropriate implementation based on environment
export const EventBus: IEventEmitter = isServer 
    ? new ServerEventEmitter() 
    : new EnhancedEventEmitter();