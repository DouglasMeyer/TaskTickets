// @flow
/* eslint-disable no-plusplus */
import { PureComponent } from 'react';
import classNamesBind from 'classnames/bind';

const classNames = classNamesBind.bind(require('./TaskTickets.css'));

type PersonType = {
  tasks: Array<number>,
  taskCompletions: {| [taskId: number]: Array<Date> |},
  redemptions: Array<Date>
}

type State = {
  tasks: {| [taskId: number]: string |},
  people: { [name: string]: PersonType },
  selectedPersonName: string | null
}

type PersonProps = {
  person: PersonType,
  name: string,
  onSelectPerson: (personName: string) => void
}

class Person extends PureComponent<PersonProps> {
  handleClick = () => {
    const { name, onSelectPerson } = this.props;
    onSelectPerson(name);
  }

  render() {
    const { name, person: { taskCompletions, redemptions } } = this.props;
    const today = new Date().toDateString();
    const todaysCompletions = Object.values(taskCompletions)
      .reduce((a, b) => a.concat(b), [])
      .filter((d:any) => d.toDateString() === today);
    const todaysRedemptions = redemptions.filter(d => d.toDateString() === today);
    const tickets = todaysCompletions.length - todaysRedemptions.length;

    return <div className={classNames('Person')} onClick={this.handleClick}>
      <h1>{name}</h1> &nbsp; {tickets}🎟 &nbsp; →
    </div>;
  }
}

type TaskProps = {
  task: string,
  taskId: number,
  taskCompletion?: Date,
  onComplete: (taskId: number) => void,
  onUnComplete: (taskId: number) => void
}

class Task extends PureComponent<TaskProps> {
  handleChange = () => {
    const { taskId, taskCompletion, onComplete, onUnComplete } = this.props;
    const handler = taskCompletion ? onUnComplete : onComplete;
    handler(taskId);
  }

  render() {
    const { task, taskCompletion } = this.props;
    return <div className={classNames('Task')} onClick={this.handleChange}>
      <input type="checkbox" checked={!!taskCompletion} readOnly />
      {task}
    </div>;
  }
}

type SelectedPersonProps = {
  name: string,
  person: PersonType,
  tasks: $PropertyType<State, 'tasks'>,
  onComplete: (personName: string, taskId: number) => void,
  onUnComplete: (personName: string, taskId: number) => void,
  onSelectPerson: (personName?: string) => void,
  onRedeem: (personName: string) => void
}

class SelectedPerson extends PureComponent<SelectedPersonProps> {
  handleComplete = (taskId: number) => {
    const { name, onComplete } = this.props;
    onComplete(name, taskId);
  }
  handleUnComplete = (taskId: number) => {
    const { name, onUnComplete } = this.props;
    onUnComplete(name, taskId);
  }
  handleRedeem = () => {
    const { name, onRedeem } = this.props;
    onRedeem(name);
  }
  handleClose = () => {
    this.props.onSelectPerson();
  }

  render() {
    const {
      name,
      tasks,
      person: { taskCompletions, redemptions, tasks: personTasks },
    } = this.props;
    const today = new Date().toDateString();
    const todaysCompletions = Object.values(taskCompletions)
      .reduce((a, b) => a.concat(b), [])
      .filter((d:any) => d.toDateString() === today);
    const todaysRedemptions = redemptions.filter(d => d.toDateString() === today);
    const tickets = todaysCompletions.length - todaysRedemptions.length;

    return <div className={classNames('SelectedPerson')}>
      <div style={{ position: 'absolute', top: '1em', right: '1em' }} onClick={this.handleClose}>╳</div>
      <h1>
        {name}
        <span style={{ float: 'right' }}>{tickets}🎟</span>
      </h1>
      <div className={classNames('Tasks')}>
        { personTasks
          .map(taskId =>
            <Task key={taskId} task={tasks[taskId]} taskId={taskId}
              taskCompletion={(taskCompletions[taskId] || []).find(when =>
                when.toDateString() === today
              )}
              onComplete={this.handleComplete}
              onUnComplete={this.handleUnComplete}
            />
          )
        }
        { tickets > 0
          ? <div className={classNames('SpendTicket')} onClick={this.handleRedeem}>
            🎟 Spend Ticket
          </div>
          : false
        }
      </div>
    </div>;
  }
}

function mapObject(obj, fn) {
  return Object.keys(obj)
    .reduce((newObj, key) => ({ ...newObj, [key]: fn(obj[key]) }), {});
}

function defaultState() {
  let nextTaskId = 1;
  const sharedTasks = {
    [nextTaskId++]: 'Dressed / Brush Teeth / Pick-up Room',
    [nextTaskId++]: 'Be Active 30 min',
  };
  const bigKidTasks = {
    [nextTaskId++]: 'Read 30 min',
    [nextTaskId++]: 'Create 30 min',
    [nextTaskId++]: "Mom's Choice",
  };
  const tasks = {
    ...sharedTasks,
    ...bigKidTasks
  };
  const taskCompletions:$PropertyType<PersonType, 'taskCompletions'> = { [1 + 0]: [] };
  const redemptions = [];
  const Calvin:PersonType = { tasks: Object.keys(tasks), taskCompletions, redemptions };
  const Norah:PersonType = { tasks: Object.keys(tasks), taskCompletions, redemptions };
  const Caroline:PersonType = { tasks: Object.keys(sharedTasks), taskCompletions, redemptions };
  const people:$PropertyType<State, 'people'> = { Calvin, Norah, Caroline };
  return { tasks, people, selectedPersonName: null };
}

function initState() {
  let state;
  try {
    const storeItem = localStorage.getItem('TaskTickets_state');
    if (storeItem) {
      const { tasks: jsonTasks, people: jsonPeople } = JSON.parse(storeItem);
      const people:$PropertyType<State, 'people'> = mapObject(jsonPeople, ({ tasks, taskCompletions, redemptions }) => ({
        tasks,
        taskCompletions: mapObject(taskCompletions, tcs => tcs.map(d => new Date(d))),
        redemptions: redemptions.map(d => new Date(d))
      }));

      state = { tasks: jsonTasks, people, selectedPersonName: null };
    }
  } catch (e) {
    console.error('initState error', e);
  }
  return state || defaultState();
}

export default class TaskTickets extends PureComponent<{}, State> {
  state:State = initState()

  handleSelectPerson = (selectedPersonName?: string) => {
    this.setState({ selectedPersonName }, this.persistState);
  }
  handleComplete = (personName: string, taskId: number) => {
    this.setState(({ people }) => {
      const person = people[personName];
      if (!person) return {};

      return {
        people: {
          ...people,
          [personName]: {
            ...person,
            taskCompletions: {
              ...person.taskCompletions,
              [taskId]: [
                ...(person.taskCompletions[taskId] || []),
                new Date()
              ]
            }
          }
        }
      };
    }, this.persistState);
  }
  handleUnComplete = (personName: string, taskId: number) => {
    const today = new Date();
    this.setState(({ people }) => {
      const person = people[personName];
      if (!person) return {};
      const taskCompletion = person.taskCompletions[taskId].find(when =>
        when.toDateString() === today.toDateString()
      );
      if (!taskCompletion) return {};
      const taskCompletionIndex = person.taskCompletions[taskId].indexOf(taskCompletion);

      return {
        people: {
          ...people,
          [personName]: {
            ...person,
            taskCompletions: {
              ...person.taskCompletions,
              [taskId]: [
                ...person.taskCompletions[taskId].slice(0, taskCompletionIndex),
                ...person.taskCompletions[taskId].slice(taskCompletionIndex + 1)
              ]
            }
          }
        }
      };
    }, this.persistState);
  }
  handleRedeem = (personName: string) => {
    this.setState(({ people }) => {
      const person = people[personName];
      if (!person) return {};

      return {
        people: {
          ...people,
          [personName]: {
            ...person,
            redemptions: [
              ...person.redemptions,
              new Date()
            ]
          }
        }
      };
    }, this.persistState);
  }

  persistState() {
    localStorage.setItem('TaskTickets_state', JSON.stringify(this.state));
  }

  render() {
    const { tasks, people, selectedPersonName } = this.state;
    const selectedPerson = selectedPersonName && people[selectedPersonName];

    return <div className={classNames('People')}>
      { Object.keys(people).map(personName =>
        <Person key={personName}
          person={people[personName]}
          name={personName}
          onSelectPerson={this.handleSelectPerson}
        />
      ) }
      { selectedPersonName && selectedPerson
        ? <SelectedPerson
          person={selectedPerson}
          name={selectedPersonName}
          tasks={tasks}
          onComplete={this.handleComplete}
          onUnComplete={this.handleUnComplete}
          onSelectPerson={this.handleSelectPerson}
          onRedeem={this.handleRedeem}
        />
        : null
      }
    </div>;
  }
}
