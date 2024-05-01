import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './Task.module.css';
import editImg from '../../public/pen-2-svgrepo-com.svg';
import deleteImg from '../../public/trash-bin-trash-svgrepo-com.svg';
import submitImg from '../../public/check-square-svgrepo-com.svg';
import resetImg from '../../public/close-square-svgrepo-com.svg';

function Task({
    taskName,
    taskIndex,
    taskIsActive,
    secondsLeft,
    setIsActive,
    setIsStopped,
    taskQueue,
    setTasks,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [minutes, setMinutes] = useState(Math.floor(secondsLeft / 60));
    const [seconds, setSeconds] = useState(secondsLeft % 60);
    const [newName, setNewName] = useState(taskName);
    const [error, setError] = useState('');

    // update minutes and seconds on each rerender
    useEffect(() => {
        setMinutes(Math.floor(secondsLeft / 60));
        setSeconds(secondsLeft % 60);
    }, [secondsLeft]);

    // update task name when the task is rerendered
    useEffect(() => {
        setNewName(taskName);
    }, [taskName]);

    // pause the timer when editing a task
    const handleEdit = () => {
        setIsActive(false);
        setIsEditing(true);
    };

    // stop the timer if deleting the current task
    const handleDelete = () => {
        if (taskIndex === 0) {
            setIsActive(false);
            setIsStopped(true);
            setTasks(taskQueue.slice(1));
            return;
        }
        setTasks([
            ...taskQueue.slice(0, taskIndex),
            ...taskQueue.slice(taskIndex + 1),
        ]);
    };

    const handleChangeName = (event) => {
        setNewName(event.target.value);
    };

    const handleChangeSeconds = (event) => {
        let value = event.target.value;
        if (!value) {
            setSeconds(0);
            return;
        }
        setSeconds(value);
    };

    const handleChangeMinutes = (event) => {
        let value = event.target.value;
        if (!value) {
            setMinutes(0);
            return;
        }
        setMinutes(value);
    };

    const handleSubmitEdit = (event) => {
        event.preventDefault();
        setError('');
        if (seconds == 0 && minutes == 0) {
            setError('Please specify the duration of the task');
            return;
        }
        let task = taskQueue[taskIndex];
        task.name = newName;
        task.secondsLeft = minutes * 60 + seconds;
        setTasks([
            ...taskQueue.slice(0, taskIndex),
            task,
            ...taskQueue.slice(taskIndex + 1),
        ]);
        setIsEditing(false);
    };

    const handleResetEdit = (event) => {
        event.preventDefault();
        setError('');
        setIsEditing(false);
        setNewName(taskName);
        setMinutes(Math.floor(secondsLeft / 60));
        setSeconds(secondsLeft % 60);
    };

    let viewData;

    if (!isEditing) {
        viewData = (
            <div
                className={`${styles.task} ${taskIsActive ? styles.active : ''}`}
            >
                <div className={styles.name}>{taskName}</div>
                <div className={styles.rightSide}>
                    <div className={styles.time}>
                        {minutes < 10 ? `0${minutes}` : minutes}:
                        {seconds < 10 ? `0${seconds}` : seconds}
                    </div>
                    <div className={styles.controls}>
                        <button onClick={handleEdit}>
                            <img src={editImg} />
                        </button>
                        <button onClick={handleDelete}>
                            <img src={deleteImg} />
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        viewData = (
            <form
                autoComplete="off"
                className={`${styles.form}`}
                onReset={handleResetEdit}
                onSubmit={handleSubmitEdit}
            >
                <div
                    className={`${styles.inputs} ${taskIsActive ? styles.active : ''}`}
                >
                    <input
                        required
                        className={styles.nameInput}
                        id="name"
                        name="name"
                        type="text"
                        value={newName || ''}
                        maxLength={40}
                        onChange={handleChangeName}
                    />
                    <input
                        className={styles.timeInput}
                        id="minutes"
                        name="minutes"
                        type="number"
                        value={minutes || ''}
                        min={0}
                        max={120}
                        placeholder="min"
                        onChange={handleChangeMinutes}
                    />
                    <input
                        className={styles.timeInput}
                        id="seconds"
                        name="seconds"
                        type="number"
                        value={seconds || ''}
                        min={0}
                        max={59}
                        placeholder="sec"
                        onChange={handleChangeSeconds}
                    />
                    <button type="submit">
                        <img src={submitImg} />
                    </button>
                    <button type="reset">
                        <img src={resetImg} />
                    </button>
                </div>
                {error ? <div className={styles.error}>{error}</div> : null}
            </form>
        );
    }

    return viewData;
}

Task.propTypes = {
    taskName: PropTypes.string,
    taskIsActive: PropTypes.bool,
    secondsLeft: PropTypes.number,
    taskIndex: PropTypes.number,
    taskQueue: PropTypes.array,
    setIsActive: PropTypes.func,
    setIsStopped: PropTypes.func,
    setTasks: PropTypes.func,
};

export default Task;
