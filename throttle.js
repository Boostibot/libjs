function importThrottle(lib)
{
    'use strict';

    const defaults = {
        SLEEP_DURATION: 200,
        MIN_INACTIVE_TIME: 500,
    };

    function Timer(time_in_ms, check_every = 1)
    {
        this.check_every = check_every;
        this.to_time = new Date().getTime() + time_in_ms;
        this.curr_iter = 0;
    }

    Timer.prototype.isUp = function() 
    {
        return new Date().getTime() > this.to_time;
    };
    
    Timer.prototype.iterDone = function() 
    {
        this.curr_iter ++;
        if(this.curr_iter > this.check_every)
        {
            this.curr_iter = 0;
            return this.isUp();
        }

        return false;
    };

    function skip(skip_calls_count, counter_ref, callback)
    {
        if(counter_ref.val === skip_calls_count)
        {
            callback();
            counter_ref.val = 0;
        }

        counter_ref.val++;
    }

    function sleepBefore(sleep_duration_ms, timer_ref, callback_ref, callback)
    {
        callback_ref.val = callback;

        if (timer_ref.val === undefined) 
        {
            timer_ref.val = setTimeout(function() {
                callback_ref.val();
                timer_ref.val = undefined;
            }, sleep_duration_ms);
        }
    }

    function sleepAfter(sleep_duration_ms, min_inactive_time_ms, timer_ref, timepoint_ref, callback_ref, callback, end_callback = callback)
    {
        timepoint_ref.val = Date.now();
        callback_ref.val = end_callback;

        if(timer_ref.val === undefined)
        {
            callback();
            timer_ref.val = setInterval(() => {
                if(Date.now() > min_inactive_time_ms + timepoint_ref.val)
                {
                    clearInterval(timer_ref.val);
                    timer_ref.val = undefined;
                    callback_ref.val();
                }
            }, sleep_duration_ms);
        }
    }

    function createSkip(skip_calls_count) 
    {
        const counter = lib.Ref();
        return (callback) => skip(skip_calls_count, counter, callback);
    } 

    function createSleepBefore(sleep_duration_ms = defaults.SLEEP_DURATION) 
    {
        const timer = lib.Ref();
        const callback_ref = lib.Ref();
        return (callback) => sleepBefore(sleep_duration_ms, timer, callback_ref, callback);
    }   

    function createSleepPast(sleep_duration_ms = defaults.SLEEP_DURATION, min_inactive_time_ms = defaults.MIN_INACTIVE_TIME) 
    {
        const timer = lib.Ref();
        const time_point = lib.Ref();
        const callback_ref = lib.Ref();

        return (callback) => sleepAfter(sleep_duration_ms, min_inactive_time_ms, timer, time_point, callback_ref, () => {}, callback);
    }

    function createSleepAfter(sleep_duration_ms = defaults.SLEEP_DURATION, min_inactive_time_ms = defaults.MIN_INACTIVE_TIME) 
    {
        const timer = lib.Ref();
        const time_point = lib.Ref();
        const callback_ref = lib.Ref();

        return (callback, end_callback = callback) => sleepAfter(sleep_duration_ms, min_inactive_time_ms, timer, time_point, callback_ref, callback, end_callback);
    }
    
    return {
        Timer,
        skip,
        sleepBefore,
        sleepAfter,
        createSkip,
        createSleepBefore,
        createSleepPast,
        createSleepAfter,
    };
}