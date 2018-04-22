// @flow
import { PureComponent } from 'react';
import classNamesBind from 'classnames/bind';

// import Menu from './Menu';
// import type { Cell as CellType } from './Cell/index';
// import Cell from './Cell';

const classNames = classNamesBind.bind(require('./TaskTickets.css'));

// function firstOccurrance(item, index, array) {
//   return array.indexOf(item) === index;
// }

// const mod = (x, n) => ((x % n) + n) % n;

type TaskType = {
  id: number,
  title: string
}

type TaskCompletionType = {
  taskId: number,
  when: Date
}

type PersonType = {
  name: string,
  personalTasks: Array<TaskType>,
  taskCompletions: Array<TaskCompletionType>,
  redemptions: Array<Date>
}

type PersonProps = {
  person: PersonType,
  onSelectPerson: (personName: string) => void
}

class Person extends PureComponent<PersonProps> {
  handleClick = () => {
    const { person: { name }, onSelectPerson } = this.props;
    onSelectPerson(name);
  }

  render() {
    const { person: { name, taskCompletions, redemptions } } = this.props;
    const tickets = taskCompletions.length - redemptions.length;

    return <div className={classNames('Person')} onClick={this.handleClick}>
      <h1>{name}</h1> &nbsp; {tickets}🎟 &nbsp; →
    </div>;
  }
}

type TaskProps = {
  task: TaskType,
  taskCompletion?: TaskCompletionType,
  onComplete: (taskId: number) => void,
  onUnComplete: (taskId: number) => void
}

class Task extends PureComponent<TaskProps> {
  handleChange = () => {
    const { task: { id }, taskCompletion, onComplete, onUnComplete } = this.props;
    const handler = taskCompletion ? onUnComplete : onComplete;
    handler(id);
  }

  render() {
    const { task: { title }, taskCompletion } = this.props;
    return <div className={classNames('Task')} onClick={this.handleChange}>
      <input type="checkbox" checked={!!taskCompletion} readOnly />
      {title}
    </div>;
  }
}

type SelectedPersonProps = {
  person: PersonType,
  commonTasks: Array<TaskType>,
  onComplete: (personName: string, taskId: number) => void,
  onUnComplete: (personName: string, taskId: number) => void,
  onSelectPerson: (personName?: string) => void,
  onRedeem: (personName: string) => void
}

class SelectedPerson extends PureComponent<SelectedPersonProps> {
  handleComplete = (taskId: number) => {
    this.props.onComplete(this.props.person.name, taskId);
  }
  handleUnComplete = (taskId: number) => {
    this.props.onUnComplete(this.props.person.name, taskId);
  }
  handleRedeem = () => {
    this.props.onRedeem(this.props.person.name);
  }

  render() {
    const {
      person: { name, taskCompletions, redemptions, personalTasks },
      commonTasks, onSelectPerson
    } = this.props;
    const tickets = taskCompletions.length - redemptions.length;
    const today = new Date();

    return <div className={classNames('SelectedPerson')}>
      <div style={{ position: 'absolute', top: '1em', right: '1em' }} onClick={onSelectPerson}>╳</div>
      <h1>
        {name}
        <span style={{ float: 'right' }}>{tickets}🎟</span>
      </h1>
      <div className={classNames('Tasks')}>
        { commonTasks.concat(personalTasks)
          .map(task =>
            <Task key={task.title} task={task}
              taskCompletion={taskCompletions.find(({ taskId, when }) =>
                taskId === task.id && when.toDateString() === today.toDateString()
              )}
              onComplete={this.handleComplete}
              onUnComplete={this.handleUnComplete}
            />
          )
        }
        { tickets
          ? <div className={classNames('SpendTicket')} onClick={this.handleRedeem}>
            🎟 Spend Ticket
          </div>
          : false
        }
      </div>
    </div>;
  }
}

type State = {
  commonTasks: Array<TaskType>,
  people: Array<PersonType>,
  selectedPersonName: string | null
}

let nextTaskId = 1;
const read = {
  id: nextTaskId++, // eslint-disable-line no-plusplus
  title: 'Read 30min'
};
const create = {
  id: nextTaskId++, // eslint-disable-line no-plusplus
  title: 'Create 30min'
};
const mom = {
  id: nextTaskId++, // eslint-disable-line no-plusplus
  title: 'Do one job for Mom'
};
export default class TaskTickets extends PureComponent<{}, State> {
  state:State = {
    commonTasks: [
      { id: nextTaskId++, // eslint-disable-line no-plusplus
        title: 'Sleep'
      },
      { id: nextTaskId++, // eslint-disable-line no-plusplus
        title: 'Dressed / Brush Teeth'
      },
      { id: nextTaskId++, // eslint-disable-line no-plusplus
        title: 'Pick-up Room'
      },
    ],
    people: [
      { name: 'Calvin',
        personalTasks: [read, create, mom],
        taskCompletions: [],
        redemptions: []
      },
      { name: 'Norah',
        personalTasks: [read, create, mom],
        taskCompletions: [],
        redemptions: []
      },
      { name: 'Caroline',
        personalTasks: [],
        taskCompletions: [],
        redemptions: []
      }
    ],
    selectedPersonName: null
  }

  handleSelectPerson = (selectedPersonName?: string) => {
    this.setState({ selectedPersonName });
  }
  handleComplete = (personName: string, taskId: number) => {
    this.setState(({ people }) => {
      const person = people.find(({ name }) => name === personName);
      if (!person) return {};
      const personIndex = people.indexOf(person);

      return {
        people: [
          ...people.slice(0, personIndex),
          { ...person,
            taskCompletions: [
              ...person.taskCompletions,
              { taskId, when: new Date() }
            ]
          },
          ...people.slice(personIndex + 1)
        ]
      };
    });
  }
  handleUnComplete = (personName: string, taskId: number) => {
    const today = new Date();
    this.setState(({ people }) => {
      const person = people.find(({ name }) => name === personName);
      if (!person) return {};
      const personIndex = people.indexOf(person);
      const taskCompletion = person.taskCompletions.find(({ taskId: id, when }) =>
        id === taskId && when.toDateString() === today.toDateString()
      );
      if (!taskCompletion) return {};
      const taskCompletionIndex = person.taskCompletions.indexOf(taskCompletion);

      return {
        people: [
          ...people.slice(0, personIndex),
          { ...person,
            taskCompletions: [
              ...person.taskCompletions.slice(0, taskCompletionIndex),
              ...person.taskCompletions.slice(taskCompletionIndex + 1)
            ]
          },
          ...people.slice(personIndex + 1)
        ]
      };
    });
  }
  handleRedeem = (personName: string) => {
    this.setState(({ people }) => {
      const person = people.find(({ name }) => name === personName);
      if (!person) return {};
      const personIndex = people.indexOf(person);

      return {
        people: [
          ...people.slice(0, personIndex),
          { ...person,
            redemptions: [
              ...person.redemptions,
              new Date()
            ]
          },
          ...people.slice(personIndex + 1)
        ]
      };
    });
  }

  render() {
    const { commonTasks, people, selectedPersonName } = this.state;
    const selectedPerson = people.find(person => person.name === selectedPersonName);

    return <div className={classNames('People')}>
      { people.map(person =>
        <Person key={person.name}
          person={person}
          onSelectPerson={this.handleSelectPerson}
        />
      ) }
      { selectedPerson
        ? <SelectedPerson
          person={selectedPerson}
          commonTasks={commonTasks}
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
