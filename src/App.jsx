import { useEffect, useState } from "react";
import Task from "./components/Task";
import styles from "./App.module.css";

const App = () => {
    const [taskName, setTaskName] = useState("");
    const [taskSecondsTotal, setTaskSecondsTotal] = useState(0);
    const [taskMinutesTotal, setTaskMinutesTotal] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isStopped, setIsStopped] = useState(true);
    const [isDone, setIsDone] = useState(false);
    const [globalStartTime, setGlobalStartTime] = useState(0);

    // the only custom validation error is that of non specified timer duration
    // it gets reset with each new edit for convenience
    const [error, setError] = useState("");

    const handleChangeName = event => {
        setError("");
        setTaskName(event.target.value);
    };

    const handleChangeSeconds = event => {
        setError("");
        const value = event.target.value;
        if (!value) {
            setTaskSecondsTotal(0);
            return;
        }
        setTaskSecondsTotal(value);
    };

    const handleChangeMinutes = event => {
        setError("");
        const value = event.target.value;
        if (!value) {
            setTaskMinutesTotal(0);
            return;
        }
        setTaskMinutesTotal(value);
    };

    const handleAddTask = event => {
        event.preventDefault();
        setError("");
        if (taskSecondsTotal == 0 && taskMinutesTotal == 0) {
            setError("Please specify the duration of the task");
            return;
        }
        let minutes = 0;
        let seconds = 0;
        if (taskMinutesTotal) {
            minutes = parseInt(taskMinutesTotal);
        }
        if (taskSecondsTotal) {
            seconds = parseInt(taskSecondsTotal);
        }
        let newTask = {
            name: taskName,
            totalMinutes: minutes,
            totalSeconds: seconds,
            secondsLeft: minutes * 60 + seconds,
        };
        setTasks([...tasks, newTask]);
        setTaskName("");
        setTaskSecondsTotal(0);
        setTaskMinutesTotal(0);
        setIsDone(false);
    };

    const handleGoPause = () => {
        setError("");
        if (isStopped) {
            setGlobalStartTime(Date.now());
            setIsStopped(false);
        }
        if (tasks.length) {
            setIsActive(!isActive);
        } else {
            setIsActive(false);
        }
    };

    const handleReset = () => {
        setError("");
        setIsActive(false);
        setIsStopped(true);
        if (tasks.length) {
            let task = tasks[0];
            task.secondsLeft = task.totalMinutes * 60 + task.totalSeconds;
            setTasks([task, ...tasks.slice(1)]);
        }
    };

    // The timer is correcting itself every tick
    useEffect(() => {
        if (!isActive) {
            return;
        }
        let startTime = Date.now();
        let drift = (startTime - globalStartTime) % 1000;
        let intervalTime = 1000 - drift; // correcting the interval based on the drift
        let timer = setTimeout(() => {
            if (tasks[0].secondsLeft <= 0) {
                if (tasks.length > 1) {
                    let nextTask = tasks[1];
                    nextTask.secondsLeft--;
                    setTasks([nextTask, ...tasks.slice(2)]);
                } else {
                    setTasks([]);
                    setIsActive(false);
                    setIsDone(true);
                }
                return;
            }
            let task = tasks[0];
            task.secondsLeft--;
            setTasks([task, ...tasks.slice(1)]);
        }, intervalTime);

        return () => clearTimeout(timer);
    }, [isActive, tasks]); // the timer is supposed to get triggered when a task has changed and isActive is true

    let bottom;
    let errorView;

    if (isDone) {
        bottom = <div className={styles.placeholderMessage}>All done!</div>
    } else if (!tasks.length) {
        bottom = <div className={styles.placeholderMessage}>No tasks for now :)</div>
    } else {
        bottom = <div className={styles.tasks}>
            {
                tasks.map((task, i) => {
                    return (
                        <Task
                            key={`task_${i}`}
                            taskName={task.name}
                            taskIndex={i}
                            taskIsActive={!isStopped && i === 0 || null}
                            secondsLeft={task.secondsLeft}
                            taskQueue={tasks}
                            setIsActive={setIsActive}
                            setIsStopped={setIsStopped}
                            setTasks={setTasks}
                        />
                    );
                })
            }
        </div>
    }

    if (error) {
        errorView = <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.app}>
                <div className={styles.titleBar}>
                    <div className={styles.title}>Time Tracker</div>
                    <div className={styles.controls}>
                        <button onClick={handleReset}>
                            <img src="../static/stop-svgrepo-com.svg" className={styles.buttonImage} />
                        </button>
                        <button onClick={handleGoPause}>
                            <img src={isActive ? "../static/pause-svgrepo-com.svg" : "../static/play-svgrepo-com.svg"} className={styles.buttonImage} />
                        </button>
                    </div>
                </div>
                <form autoComplete="off" className={styles.form} onSubmit={handleAddTask}>
                    <div className={styles.inputs}>
                        <input
                            className={styles.nameInput}
                            required
                            name="name"
                            id="name"
                            type="text"
                            value={taskName}
                            placeholder="Task name"
                            onChange={handleChangeName}
                            maxLength={40}
                        />
                        <input
                            className={styles.timeInput}
                            name="minutes"
                            id="minutes"
                            type="number"
                            min={0}
                            max={600}
                            value={taskMinutesTotal || ""}
                            placeholder="min"
                            onChange={handleChangeMinutes}
                        />
                        <input
                            className={styles.timeInput}
                            name="seconds"
                            id="seconds"
                            type="number"
                            min={0}
                            max={59}
                            value={taskSecondsTotal || ""}
                            placeholder="sec"
                            onChange={handleChangeSeconds}
                        />
                        <button type="submit" >
                            <img src="../static/add-square-svgrepo-com.svg" className={styles.buttonImage}></img>
                        </button>
                    </div>
                    {errorView}
                </form>
                {bottom}
            </div>
        </div>
    );
};

export default App;
