import axios from "axios";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import Header from "../components/Header";
import { useMutation } from "react-query";
import DatePicker from "react-datepicker";
import { BsFlagFill } from "react-icons/bs";
import { GrFormViewHide } from "react-icons/gr";
import useGetAllTodo from "../hooks/useGetTodos";
import "react-datepicker/dist/react-datepicker.css";
import { GrFormView } from "react-icons/gr";

import TodoList from "../components/TodoList";
import CustomDateInput from "../components/CustomDateInput";
import EditTaskModal from "../components/EditTaskModal";
import { useApp } from "../states/app";

const DEFAULT_TODO = {
  title: "",
  content: "",
  isCompleted: false,
  priority: { isHigh: false, isMedium: false, isLow: false, isNone: true },
  createdAt: new Date(),
  deadline: new Date(),
};

const TodoApp = () => {
  const { data, refetch } = useGetAllTodo();

  console.log("data", data);

  const {
    editTask,
    addTask,
    setAddTask,
    selectTodoDate,
    setSelectTodoDate,
    editModalShow,
    localUsername,
    activeAddTodo,
    setActiveAddTodo,
  } = useApp();

  console.log("localUserName", localUsername);

  const [todayTask, setTodayTask] = useState();
  const [overdueTask, setOverdueTask] = useState();
  const [upcomingTask, setUpcomingTask] = useState();
  const [completedTask, setCompletedTask] = useState();
  const [showCompletedTodo, setShowCompletedTodo] = useState(false);

  const viewCompletedTodo = () => {
    setShowCompletedTodo(!showCompletedTodo);
  };

  const requestAddTodo = useMutation(() => {
    return axios.post(
      "https://63132301b466aa9b03939063.mockapi.io/api/todos",
      addTask
    );
  });

  const handleSubmit = async () => {
    await requestAddTodo.mutateAsync();
    setAddTask(DEFAULT_TODO);
    setSelectTodoDate(null);
    refetch();
  };

  useEffect(() => {
    const todayTodos = data?.filter(
      (item) =>
        format(
          new Date(item.deadline ? item.deadline : item.createdAt),
          "dd/MM/yyyy"
        ) === format(new Date(), "dd/MM/yyyy") && item.isCompleted === false
    );

    const overdueTodos = data?.filter(
      (item) =>
        format(
          new Date(item.deadline ? item.deadline : item.createdAt),
          "dd/MM/yyyy"
        ) < format(new Date(), "dd/MM/yyyy") && item.isCompleted === false
    );

    const upComingTodos = data?.filter(
      (item) =>
        format(
          new Date(item.deadline ? item.deadline : item.createdAt),
          "dd/MM/yyyy"
        ) > format(new Date(), "dd/MM/yyyy") && item.isCompleted === false
    );

    const completedTodos = data?.filter((item) => item.isCompleted);

    setUpcomingTask(upComingTodos);
    setTodayTask(todayTodos);
    setOverdueTask(overdueTodos);
    setCompletedTask(completedTodos);
    refetch();
  }, [data]);

  useEffect(() => {
    setAddTask({
      ...addTask,
      deadline: selectTodoDate,
    });
  }, [selectTodoDate]);

  return (
    <div className="font-nunito">
      <Header />
      <div className="container mx-auto w-2/3 ">
        <div className="flex items-center justify-between mt-10">
          <div className="flex items-center justify-between gap-2">
            <p className="text-2xl">Today</p>
            <p className="text-xs opacity-50">{format(new Date(), "PP")}</p>
          </div>
          {!showCompletedTodo && (
            <button
              onClick={viewCompletedTodo}
              className="flex items-center gap-1.5 text-xl opacity-70"
            >
              <GrFormViewHide />
              <p className="text-sm">View Completed</p>
            </button>
          )}
          {showCompletedTodo && (
            <button
              onClick={viewCompletedTodo}
              className="flex items-center gap-1.5 text-xl opacity-70"
            >
              <GrFormView />
              <p className="text-sm">View Completed</p>
            </button>
          )}
        </div>
        <div className="my-4">
          <div>
            <h1 className="font-bold text-red-700">Overdue</h1>
          </div>
          {overdueTask && overdueTask.map((task) => <TodoList task={task} />)}
        </div>
        <div className="my-4">
          <div>
            <h1 className="font-bold text-green-700">Today</h1>
          </div>
          {todayTask && todayTask.map((task) => <TodoList task={task} />)}
        </div>
        <div className="my-4">
          <div>
            <h1 className="font-bold text-yellow-500">Upcoming</h1>
          </div>
          {upcomingTask && upcomingTask.map((task) => <TodoList task={task} />)}
        </div>
        <button
          onClick={() => setActiveAddTodo(!activeAddTodo)}
          className="flex group items-center gap-2 opacity-80 my-5"
        >
          <div
            className={`${
              activeAddTodo
                ? "bg-red-700 text-white rounded-full"
                : "text-red-700"
            }   p-0.5 group-hover:rounded-full group-hover:text-white group-hover:bg-red-700`}
          >
            <HiPlus />
          </div>
          <p
            className={`${
              activeAddTodo ? "text-red-700" : ""
            } group-hover:text-red-700 text-sm`}
          >
            Add task
          </p>
        </button>
        {activeAddTodo && !editModalShow && (
          <div className="flex flex-col gap-2 border rounded p-2">
            <div className="flex items-center justify-between">
              <input
                onChange={(e) =>
                  setAddTask({ ...addTask, title: e.target.value })
                }
                value={addTask.title}
                className="w-full px-2 outline-none"
                type="text"
                placeholder="Title .."
              />
              <div className="pr-3">
                <DatePicker
                  selected={selectTodoDate}
                  onChange={(date) => setSelectTodoDate(date)}
                  customInput={<CustomDateInput />}
                  withPortal
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
            <input
              onChange={(e) =>
                setAddTask({ ...addTask, content: e.target.value })
              }
              value={addTask.content}
              type="text"
              placeholder="Description"
              className="w-full outline-none px-2 placeholder:text-sm"
            />
            <div className="flex items-center justify-between gap-3 m-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setAddTask({
                      ...addTask,
                      priority: {
                        isHigh: true,
                        isMedium: false,
                        isLow: false,
                        isNone: false,
                      },
                    })
                  }
                  className={`${
                    addTask.priority.isHigh
                      ? "opacity-100 border-b-[0.5px] border-red-500"
                      : "opacity-30 hover:opacity-100"
                  } text-red-500`}
                >
                  <BsFlagFill />
                </button>
                <button
                  onClick={() =>
                    setAddTask({
                      ...addTask,
                      priority: {
                        isHigh: false,
                        isMedium: true,
                        isLow: false,
                        isNone: false,
                      },
                    })
                  }
                  className={`${
                    addTask.priority.isMedium
                      ? "opacity-100 border-b-[0.5px] border-yellow-500"
                      : "opacity-30 hover:opacity-100"
                  } text-yellow-500`}
                >
                  <BsFlagFill />
                </button>

                <button
                  onClick={() =>
                    setAddTask({
                      ...addTask,
                      priority: {
                        isHigh: false,
                        isMedium: false,
                        isLow: true,
                        isNone: false,
                      },
                    })
                  }
                  className={`${
                    addTask.priority.isLow
                      ? "opacity-100 border-b-[0.5px] border-blue-500"
                      : "opacity-30 hover:opacity-100"
                  } text-blue-500`}
                >
                  <BsFlagFill />
                </button>
                <button
                  onClick={() =>
                    setAddTask({
                      ...addTask,
                      priority: {
                        isHigh: false,
                        isMedium: false,
                        isLow: false,
                        isNone: true,
                      },
                    })
                  }
                  className={`${
                    addTask.priority.isNone
                      ? "opacity-100 border-b-[0.5px] border-gray-400"
                      : "opacity-30 hover:opacity-100"
                  } text-gray-400`}
                >
                  <BsFlagFill />
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={addTask.title === "" ? true : false}
                className={`text-xs rounded bg-primaryBlue text-white hover:bg-primaryGreen px-3 py-1 disabled:opacity-50`}
              >
                Add Task
              </button>
            </div>
          </div>
        )}
        {showCompletedTodo && (
          <div className="mt-10">
            <h1 className="font-bold text-gray-500">Completed Todos</h1>
            <div>
              {completedTask &&
                completedTask?.map((task) => <TodoList task={task} />)}
            </div>
          </div>
        )}
      </div>
      <EditTaskModal task={editTask} />
    </div>
  );
};

export default TodoApp;