// @flow
import { render } from 'react-dom';
import classNamesBind from 'classnames/bind';
import TaskTickets from './TaskTickets';

const classNames = classNamesBind.bind(require('./index.css'));

const root = document.createElement('div');
root.id = classNames('root');
if (document.body) document.body.appendChild(root);
render(<TaskTickets />, root);
