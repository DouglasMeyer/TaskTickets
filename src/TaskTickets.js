// @flow
/* eslint-disable no-plusplus */
import { Fragment, PureComponent } from 'react';
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
  inAdmin: boolean
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
      <h1>
        {name}
        <span style={{ float: 'right' }}>{tickets}🎟</span>
      </h1>
      <div className={classNames('Back')} onClick={this.handleClose}>╳</div>
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

type PeopleProps = {
  tasks: $PropertyType<State, 'tasks'>,
  people: $PropertyType<State, 'people'>,
  onComplete: (personName: string, taskId: number) => void,
  onUnComplete: (personName: string, taskId: number) => void,
  onRedeem: (personName: string) => void
}
type PeopleState = { selectedPersonName: ?string }

class People extends PureComponent<PeopleProps, PeopleState> {
  state = { selectedPersonName: null }

  handleSelectPerson = (selectedPersonName?:string) => {
    this.setState({ selectedPersonName });
  }
  handleComplete = this.props.onComplete
  handleUnComplete = this.props.onUnComplete
  handleRedeem = this.props.onRedeem

  render() {
    const { tasks, people } = this.props;
    const { selectedPersonName } = this.state;
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

type AdminProps = {
  tasks: $PropertyType<State, 'tasks'>,
  people: $PropertyType<State, 'people'>,
  onAddPerson: () => void,
  onAddTask: () => void,
  onRenamePerson: (oldName: string, newName: string) => void,
  onRenameTask: (taskId: number, newName: string) => void,
  onTogglePersonTask: (personName: string, taskId: number) => void,
  onRemovePerson: (personName: string) => void,
  onRemoveTask: (taskId: number) => void,
  onClose: () => void
}
type AdminState = {
  selectedPersonName: ?string
}
class Admin extends PureComponent<AdminProps, AdminState> {
  personKeys:WeakMap<*, number> = new WeakMap()
  lastPersonKey = 0
  state = { selectedPersonName: null }

  handleAddPerson = this.props.onAddPerson
  handleAddTask = this.props.onAddTask
  handleRenamePerson = this.props.onRenamePerson
  handleRenameTask = this.props.onRenameTask
  handleTogglePersonTask = this.props.onTogglePersonTask
  handleRemovePerson = this.props.onRemovePerson
  handleRemoveTask = this.props.onRemoveTask
  handleClose = this.props.onClose

  renderPerson(person:PersonType, personName:string) {
    const { tasks } = this.props;

    const events = [
      ...person.redemptions.map(when => ({ when, what: 'Redeemed a ticket' })),
      ...Object.keys(person.taskCompletions)
        .reduce((acc, taskId) => [
          ...acc,
          ...person.taskCompletions[(taskId:any)].map(when => ({ when, what: `Completed: ${tasks[(taskId:any)] || 'removed task'}` }))
        ], [])
    ].sort((e1, e2) => e2.when - e1.when);

    return <div className={classNames('Admin')}>
      <div style={{ position: 'absolute', right: 0 }} onClick={() => this.setState({ selectedPersonName: null })}>╳</div>
      <h1>{personName}</h1>
      {events.map(({ when, what }, index) =>
        <Fragment key={when.toJSON()}>
          { !events[index - 1] || when.toDateString() !== events[index - 1].when.toDateString()
            ? <time dateTime={when.toDateString()}>{when.toDateString()}</time>
            : false
          }
          <div>
            <time dateTime={when.toJSON()} style={{ display: 'inline-block', width: '8em', textAlign: 'right' }}>{when.toLocaleTimeString()}</time>
            {' - '}
            {what}
          </div>
        </Fragment>
      )}
    </div>;
  }

  renderPeople() {
    const { people, tasks } = this.props;
    Object.values(people)
      .filter((person:any) => !this.personKeys.has(person))
      .forEach((person:any) => this.personKeys.set(person, this.lastPersonKey++));

    return <table className={classNames('Admin')}>
      <tbody>
        <tr>
          <td>
            <div className={classNames('Back')} onClick={this.handleClose}>╳</div>
          </td>
          {Object.keys(people).map(name =>
            <th key={this.personKeys.get(people[name])}>
              <input
                value={name}
                onChange={({ target: { value } }) => this.handleRenamePerson(name, value)}
              />
              <a onClick={() => this.setState({ selectedPersonName: name })}>show activity</a>
            </th>
          )}
          <th><button onClick={this.handleAddPerson}>new person</button></th>
        </tr>
        {Object.keys(tasks).map((taskId:any) =>
          <tr key={taskId}>
            <td>
              <textarea
                value={tasks[taskId]}
                onChange={({ target: { value } }) => this.handleRenameTask(taskId, value)}
              />
            </td>
            {Object.keys(people).map(personName =>
              <td key={personName}>
                <input type="checkbox" checked={people[personName].tasks.includes(taskId)} onChange={() => this.handleTogglePersonTask(personName, taskId)} />
              </td>
            )}
            <td>
              <button onClick={() => this.handleRemoveTask(taskId)}>remove task</button>
            </td>
          </tr>
        )}
        <tr>
          <td><button onClick={this.handleAddTask}>new task</button></td>
          {Object.keys(people).map(name =>
            <th key={this.personKeys.get(people[name])}>
              <button onClick={() => this.handleRemovePerson(name)}>remove {name}</button>
            </th>
          )}
          <td />
        </tr>
      </tbody>
    </table>;
  }

  render() {
    const { people } = this.props;
    const { selectedPersonName } = this.state;
    const selectedPerson = selectedPersonName && people[selectedPersonName];

    return selectedPerson
      ? this.renderPerson(selectedPerson, (selectedPersonName:any))
      : this.renderPeople();
  }
}

function mapObject<T, P>(obj:{[any]:P}, fn:(P) => P):T {
  return Object.keys(obj)
    .reduce(
      (newObj:T, key) => ({ ...newObj, [key]: fn(obj[key]) }:any),
      ({}:any)
    );
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
  const Billy:PersonType = { tasks: Object.keys(tasks), taskCompletions, redemptions };
  const Susan:PersonType = { tasks: Object.keys(tasks), taskCompletions, redemptions };
  const Theodore:PersonType = { tasks: Object.keys(sharedTasks), taskCompletions, redemptions };
  const people:$PropertyType<State, 'people'> = { Billy, Susan, Theodore };
  return { tasks, people, inAdmin: true };
}

function initState() {
  let state;
  const lastWeek = new Date(Date.now() - (1000 * 60 * 60 * 24 * 7));
  try {
    const storeItem = localStorage.getItem('TaskTickets_state');
    if (storeItem) {
      const { tasks: jsonTasks, people: jsonPeople } = JSON.parse(storeItem);
      const people:$PropertyType<State, 'people'> =
        mapObject(jsonPeople, ({ tasks, taskCompletions, redemptions }) => ({
          tasks,
          taskCompletions: mapObject(taskCompletions,
            tcs => tcs
              .map(d => new Date(d))
              .filter(d => d > lastWeek)
          ),
          redemptions: redemptions.map(d => new Date(d)).filter(d => d > lastWeek)
        }));

      state = { tasks: jsonTasks, people, inAdmin: false };
    }
  } catch (e) {
    console.error('initState error', e); // eslint-disable-line no-console
  }
  return state || defaultState();
}

export default class TaskTickets extends PureComponent<{}, State> {
  state:State = initState()

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
  handleToAdmin = () => { this.setState({ inAdmin: true }); }
  handleCloseAdmin = () => { this.setState({ inAdmin: false }); }
  handleAddPerson = () => {
    this.setState(({ people }) => ({
      people: {
        ...people,
        'new Person': { tasks: [], taskCompletions: {}, redemptions: [] }
      }
    }), this.persistState);
  }
  handleAddTask = () => {
    this.setState(({ tasks }) => ({
      tasks: {
        ...tasks,
        [Math.max(0, ...(Object.keys(tasks):any)) + 1]: 'new Task'
      }
    }), this.persistState);
  }
  handleRenamePerson = (oldName:string, newName:string) => {
    this.setState(({ people }) => ({
      people: Object.keys(people)
        .reduce((newPeople, personName) => ({
          ...newPeople,
          [personName === oldName ? newName : personName]: people[personName]
        }), {})
    }), this.persistState);
  }
  handleRenameTask = (taskId:number, newName:string) => {
    this.setState(({ tasks }) => ({
      tasks: {
        ...tasks,
        [taskId]: newName
      }
    }), this.persistState);
  }
  handleTogglePersonTask = (personName:string, taskId:number) => {
    this.setState(({ people }) => {
      const person = people[personName];
      const taskIndex = person.tasks.indexOf(taskId);
      const tasks = taskIndex === -1
        ? [...person.tasks, taskId]
        : [
          ...person.tasks.slice(0, taskIndex),
          ...person.tasks.slice(taskIndex + 1)
        ];

      return ({
        people: {
          ...people,
          [personName]: { ...person, tasks }
        }
      });
    }, this.persistState);
  }
  handleRemovePerson = (personName:string) => {
    this.setState(({ people: { [personName]: _person, ...otherPeople } }) => ({
      people: { ...otherPeople }
    }), this.persistState);
  }
  handleRemoveTask = (taskId:number) => {
    this.setState(({ people, tasks: { [taskId]: _task, ...otherTasks } }) => ({
      tasks: { ...otherTasks },
      people: mapObject(people, person => ({
        ...person,
        tasks: person.tasks.filter(id => id !== taskId)
      }))
    }), this.persistState);
  }

  persistState() {
    localStorage.setItem('TaskTickets_state', JSON.stringify(this.state));
  }

  render() {
    const { tasks, people, inAdmin } = this.state;

    return inAdmin
      ? <Admin {...{
        tasks,
        people,
        onAddPerson: this.handleAddPerson,
        onAddTask: this.handleAddTask,
        onRenamePerson: this.handleRenamePerson,
        onRenameTask: this.handleRenameTask,
        onTogglePersonTask: this.handleTogglePersonTask,
        onRemovePerson: this.handleRemovePerson,
        onRemoveTask: this.handleRemoveTask,
        onClose: this.handleCloseAdmin
      }} />
      : <Fragment>
        <div className={classNames('ToAdmin')} onClick={this.handleToAdmin}>⚙</div>
        <People
          {...{
            tasks,
            people,
            onComplete: this.handleComplete,
            onUnComplete: this.handleUnComplete,
            onRedeem: this.handleRedeem
          }}
        />
      </Fragment>;
  }
}
