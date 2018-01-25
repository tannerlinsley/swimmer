const defaultConfig = {
  concurrency: 5,
  started: true,
  tasks: []
}

export function createPool (config = defaultConfig) {
  const { concurrency, started, tasks } = {
    ...defaultConfig,
    ...config
  }

  let onSettles = []
  let onErrors = []
  let onSuccesses = []
  let running = started
  let active = []
  let pending = tasks
  let currentConcurrency = concurrency

  const tick = () => {
    if (!running) {
      return
    }
    if (!pending.length && !active.length) {
      onSettles.forEach(d => d())
      return
    }
    while (active.length < currentConcurrency && pending.length) {
      const nextFn = pending.shift()
      active.push(nextFn)
      /* eslint-disable no-loop-func */
      ;(async () => {
        let success = false
        let res
        let error
        try {
          res = await nextFn()
          success = true
        } catch (e) {
          error = e
        }
        active = active.filter(d => d !== nextFn)
        if (success) {
          nextFn.resolve(res)
          onSuccesses.forEach(d => d(res, nextFn))
        } else {
          nextFn.reject(error)
          onErrors.forEach(d => d(error, nextFn))
        }
        tick()
      })()
      /* eslint-enable no-loop-func */
    }
  }

  const api = {
    add: fn =>
      new Promise((resolve, reject) => {
        pending.push(fn)
        fn.resolve = resolve
        fn.reject = reject
        tick()
      }),
    throttle: n => {
      currentConcurrency = n
    },
    onSettled: cb => {
      onSettles.push(cb)
      return () => {
        onSettles = onSettles.filter(d => d !== cb)
      }
    },
    onError: cb => {
      onErrors.push(cb)
      return () => {
        onErrors = onErrors.filter(d => d !== cb)
      }
    },
    onSuccess: cb => {
      onSuccesses.push(cb)
      return () => {
        onSuccesses = onSuccesses.filter(d => d !== cb)
      }
    },
    stop: () => {
      running = false
    },
    start: () => {
      running = true
      tick()
    },
    clear: () => {
      pending = []
    },
    getActive: () => active,
    getPending: () => pending,
    getAll: () => [...active, ...pending],
    isRunning: () => running,
    isSettled: () => !running && !active.length && !pending.length
  }

  return api
}

export function poolAll (tasks, concurrency) {
  return new Promise((resolve, reject) => {
    const pool = createPool({
      concurrency
    })
    const results = []
    pool.onSettled(() => {
      resolve(results)
    })
    pool.onError(err => {
      reject(err)
    })
    tasks.forEach((task, i) => {
      pool.add(async () => {
        const res = await task()
        results[i] = res
        return res
      })
    })
    pool.start()
  })
}
