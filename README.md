# 🏊‍ swimmer

[![Travis CI Build Status](https://travis-ci.org/tannerlinsley/swimmer.svg?branch=master)](https://travis-ci.org/tannerlinsley/swimmer)
[![David Dependancy Status](https://david-dm.org/tannerlinsley/swimmer.svg)](https://david-dm.org/tannerlinsley/swimmer)
[![npm package v](https://img.shields.io/npm/v/swimmer.svg)](https://www.npmjs.org/package/swimmer)
[![npm package dm](https://img.shields.io/npm/dm/swimmer.svg)](https://npmjs.com/package/swimmer)
[![Join the community on Slack](https://img.shields.io/badge/slack-react--chat-blue.svg)](https://react-chat-signup.herokuapp.com/)
[![Github Stars](https://img.shields.io/github/stars/tannerlinsley/swimmer.svg?style=social&label=Star)](https://github.com/tannerlinsley/swimmer)
[![Twitter Follow](https://img.shields.io/twitter/follow/nozzleio.svg?style=social&label=Follow)](https://twitter.com/nozzleio)


An async task pooling and throttling utility for javascript.

## Features
- 🚀 3kb and zero dependencies
- 🔥 ES6 and async/await ready
- 😌 Simple to use!

## Interactive Demo
 - [CodeSandbox](https://codesandbox.io/s/mq2j7jq39x?expanddevtools=1&hidenavigation=1)

## Installation
```bash
$ yarn add swimmer
# or
$ npm i swimmer --save
```

## UMD
```
https://unpkg.com/swimmer/umd/swimmer.min.js
```

## Inline Pooling
Inline Pooling is great for:
- Throttling intensive tasks in a serial fashion
- Usage with async/await and promises.
- Ensuring that all tasks succeed.

```javascript
import { poolAll } from 'swimmer'

const urls = [...]

const doIntenseTasks = async () => {
  try {
    const res = await poolAll(
      urls.map(task =>
        () => fetch(url) // Return an array of functions that return a promise
      ),
      10 // Set the concurrency limit
    )
  } catch (err, task) {
    // If an error is encountered, the entire pool stops and the error is thrown
    console.log(`Encountered an error with task: ${task}`)
    throw err
  }

  // If no errors are thrown, you get your results!
  console.log(res) // [result, result, result, result]
}
```

## Custom Pooling
Custom pools are great for:
- Non serial
- Reusable pools
- Handling errors gracefully
- Task management and retry
- Variable throttle speed, pausing, resuming of tasks

```javascript
import { createPool } from 'swimmer'

const urls = [...]
const otherUrls = [...]

// Create a new pool with a throttle speed and some default tasks
const pool = createPool({
  concurrency: 5,
  tasks: urls.map(url => () => fetch(url))
})

// Subscribe to errors
pool.onError((err, task) => {
  console.warn(err)
  console.log(`Encountered an error with task ${task}. Resubmitting to pool!`)
  pool.add(task)
})

// Subscribe to successes
pool.onSuccess((res, task) => {
  console.log(`Task Complete. Result: ${res}`)
})

// Subscribe to settle
pool.onSettled(() => console.log("Pool is empty. All tasks are finished!"))

const doIntenseTasks = () => {
  // Add some tasks to the pool.
  tasks.forEach(
    url => pool.add(
      () => fetch(url)
    )
  )

  // Increase the concurrency to 10! This can also be done while it's running.
  pool.throttle(10)

  // Pause the pool
  pool.stop()

  // Start the pool again!
  pool.start()

  // Add some more tasks!
  otherUrls.forEach(
    url => pool.add(
      () => fetch(url)
    )
  )

  // Clear the pool. Any running tasks will continue until finished.
  pool.clear()
}
```

### API
Swimmer exports two functions:
- `poolAll`
  - Arguments
    - `Array[Function => Promise]` - An array of functions that return a promise.
    - `Int` - The currency limit for this pool.
  - Returns
    - A `Promise`
  - Example:
  ```javascript
    async function () {
      const res = await poolAll(tasks.map(task => () => task()), 5)
    }
  ```
- `createPool`
  - Arguments
    - `Object{}` - An optional configuration object for this pool
      - `concurrency: Int (default: 5)` - The currency limit for this pool.
      - `started: Boolean (default: true)` - Whether the pool should be started by default or not.
      - `tasks: Array[Function => Promise]` - An array of functions that return a promise. These tasks will be preloaded into the pool.
  - Returns
    - `Object{}`
      - `add(() => Promise)` - Adds a task to the pool.
      - `start()` - Starts the pool.
      - `stop()` - Stops the pool.
      - `throttle(Int)` - Sets a new concurrency rate for the pool.
      - `clear()` - Clears all pending tasks from the pool.
      - `getActive()` - Returns all active tasks.
      - `getPending()` - Returns all pending tasks.
      - `getAll()` - Returns all tasks.
      - `isRunning()` - Returns `true` if the pool is running.
      - `isSettled()` - Returns `true` if the pool is settled.
      - `onSuccess((result, task) => {})` - Registers an onSuccess callback.
      - `onError((error, task) => {})` - Registers an onError callback.
      - `onSettled(() => {})` - Registers an onSettled callback.

## Tip of the year
Make sure you are passing an array of `thunks`. A thunk is a function that returns your task, not your task itself. If you pass an array of tasks that have already been fired off then it's too late for Swimmer to manage them :(

## Contributing

We are always looking for people to help us grow `swimmer`'s capabilities and examples. If you have an issue, feature request, or pull request, let us know!

## License

Swimmer uses the MIT license. For more information on this license, [click here](https://github.com/tannerlinsley/swimmer/blob/master/LICENSE).

[build-badge]: https://img.shields.io/travis/tannerlinsley/swimmer/master.png?style=flat-square
[build]: https://travis-ci.org/tannerlinsley/swimmer

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/swimmer

[coveralls-badge]: https://img.shields.io/coveralls/tannerlinsley/swimmer/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/tannerlinsley/swimmer
