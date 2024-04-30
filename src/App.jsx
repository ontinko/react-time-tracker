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
    const [error, setError] = useState("");

    const handleChangeName = event => {
        setTaskName(event.target.value);
    };

    const handleChangeSeconds = event => {
        const value = event.target.value;
        if (!value) {
            setTaskSecondsTotal(0);
            return;
        }
        setTaskSecondsTotal(value);
    };

    const handleChangeMinutes = event => {
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
        if (isStopped) {
            setIsStopped(false);
        }
        if (tasks) {
            setIsActive(!isActive);
        } else {
            setIsActive(false);
        }
    };

    const handleReset = () => {
        setIsActive(false);
        setIsStopped(true);
        if (tasks.length) {
            let task = tasks[0];
            task.secondsLeft = task.totalMinutes * 60 + task.totalSeconds;
            setTasks([task, ...tasks.slice(1)]);
        }
    };

    // TOFIX: timer has additional delay, redo to be self-correcting
    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                if (!tasks) {
                    setIsActive(false);
                    clearInterval(interval);
                    setIsDone(true);
                    return;
                }
                if (tasks[0].secondsLeft <= 0) {
                    clearInterval(interval);
                    if (tasks.length > 1) {
                        let nextTask = tasks[1];
                        nextTask.secondsLeft--;
                        setTasks([nextTask, ...tasks.slice(2)]);
                    } else {
                        setTasks([...tasks.slice(1)]);
                    }
                    return;
                }
                let task = tasks[0];
                task.secondsLeft--;
                setTasks([task, ...tasks.slice(1)]);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isActive, tasks]);

    return (
        <div className={styles.container}>
            <div className={styles.app}>
                <div className={styles.titleBar}>
                    <div className={styles.title}>Time Tracker</div>
                    <div className={styles.controls}>
                        <button onClick={handleReset} className={styles.button}>
                            <img src="../static/stop-svgrepo-com.svg" className={styles.buttonImage} />
                        </button>
                        <button className={styles.button}
                            onClick={handleGoPause}
                        >
                            <img src={isActive ? "../static/pause-svgrepo-com.svg" : "../static/play-svgrepo-com.svg"} className={styles.buttonImage} />
                        </button>
                    </div>
                </div>
                <form className={styles.form} onSubmit={handleAddTask}>
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
                            className={styles.minutesInput}
                            name="minutes"
                            id="minutes"
                            type="number"
                            min={0}
                            max={120}
                            value={taskMinutesTotal || ""}
                            placeholder="min"
                            onChange={handleChangeMinutes}
                        />
                        <input
                            className={styles.secondsInput}
                            name="seconds"
                            id="seconds"
                            type="number"
                            min={0}
                            max={59}
                            value={taskSecondsTotal || ""}
                            placeholder="sec"
                            onChange={handleChangeSeconds}
                        />
                        <button className={styles.button} type="submit" >
                            <img src="../static/add-square-svgrepo-com.svg" className={styles.buttonImage}></img>
                        </button>
                    </div>
                    {error ? <div className={styles.error}>{error}</div> : null}
                </form>
                <div className={styles.tasks}>
                    {isDone
                        ? "Time is up!"
                        : tasks.map((task, i) => {
                            return (
                                <Task
                                    key={i}
                                    taskName={task.name}
                                    taskIndex={i}
                                    taskIsActive={!isStopped && i === 0 || null}
                                    secondsLeft={task.secondsLeft}
                                    taskQueue={tasks}
                                    setIsActive={setIsActive}
                                    setTasks={setTasks}
                                />
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default App;
