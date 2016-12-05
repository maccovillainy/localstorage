import  React  from 'react';
import  ReactDOM  from 'react-dom';
import  ee  from 'event-emitter';
import { Router, Route, IndexRoute, hashHistory, Link } from 'react-router';

let app = document.querySelector('#hello'),
  emitter = ee({}), 
  listener,
  dataJSON = [
  {
    id: 0,
    name: "first board",
    tasks:[
      {
      id: 0,
      name: "task1",
      check: false
      },
      {
        id: 1,
        name: "task2",
        check: false
      },
      {
        id: 2,
        name: "task3",
        check: false
      },
      {
        id: 3,
        name: "task4",
        check: false
      }
    ]
  },
  {
    id: 1,
    name: "second board",
    tasks:[
      {
      id: 0,
      name: "task11",
      check: false
      },
      {
        id: 1,
        name: "task21",
        check: false
      },
      {
        id: 2,
        name: "task31",
        check: false
      },
      {
        id: 3,
        name: "task41",
        check: false
      }
    ]
  }
    
  ];
//localStorage.clear()
if ( !localStorage.getItem('data') ){
  localStorage.setItem('data', JSON.stringify(dataJSON))
}
let data = JSON.parse(localStorage.getItem('data'))

//////////////////////////////////////////////////

class Tasks extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      check: this.props.data.check
    }
  }
  OnCheck(i){
    this.setState({ check: !this.state.check })
    emitter.emit('checkUnCheck', i, this.props.parentId, this.state.check);
  }
  del(i){
    emitter.emit('deleted', i, this.props.parentId);
  }
  render(){
    return(
      <div>

            <label className={ this.state.check ? 'selected' : '' }>{this.props.data.name}
              <input
                onChange={this.OnCheck.bind(this, this.props.id)} 
                type='checkbox'
                checked={this.state.check ? true : false } />
            </label>
            <a onClick={this.del.bind(this, this.props.data.id)} href='#' className='del'></a>
      </div>
    )
  }
}

////////////////////////////////////

class Board extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.data.tasks.length,
      task: []
    }
  }
  componentDidMount() {
    this.setState({task: this.props.data.tasks})

    emitter.on('deleted', listener = (id, boardId )=>{
      if (boardId === this.props.id){
      let newData = this.state.task.filter((item, i) => item.id == id ? false : item)
      this.setState({task: newData})
      emitter.emit('toLS', newData, this.props.id)
    }
    })

    emitter.on('checkUnCheck', listener = (id, boardId, bul )=>{
      if (boardId === this.props.id){
      let newData = this.state.task.map((item, i) => {
        if (item.id == id) item.check = !item.check
          return item
      })
      this.setState({task: newData})
      emitter.emit('toLS', newData, this.props.id)
    }
    })
  }
  add(){
      let newData = this.state.task.map(item => item)
      newData.push({
        name: ReactDOM.findDOMNode(this.refs.input).value,
        check: false,
        id: this.state.id++
      })
      this.setState({task: newData})
      emitter.emit('toLS', newData, this.props.id)
  }
  deleteBorder(elem){
    emitter.emit('delBoard', elem)
  }
  render(){
    return(
        <div style={{border: '1px solid tomato', margin: 20, width: 300}}>
              <h2>{this.props.data.name}</h2>
        {this.state.task.filter(item => item.check).length} of {this.state.task.length}
          <a onClick={this.deleteBorder.bind(this, this.props.id)} 
            style={{display: 'block'}} href='#'>
            Delete Board
          </a>
          <input ref='input'/>
          <button onClick={this.add.bind(this)}>Add task</button>
            <div>
              {this.state.task.map(item => (
                <Tasks key={item.id} id={item.id} parentId={this.props.id} data={item}/>
              ))}
            </div>
          
        </div>
        );
  }
}

///////////////

//////////////////////////////////////////////////////////

class MainApp extends React.Component{
  constructor(props) {
    super()
    this.state = {
      data: data,
      id: data.length
    }
  }
  componentDidMount() {
    this.setState({
      data: data
    })

    emitter.on('delBoard', listener = id =>{
      let newData = this.state.data.filter(item => item.id == id ? false : item)
      this.setState({data: newData})
      localStorage.setItem('data', JSON.stringify(newData))
    })

    emitter.on('toLS', listener = (obj, id )=>{
      let newDataToLS = this.state.data.map(item =>{
        if (item.id === id) item.tasks = obj
          return item
      })
      localStorage.setItem('data', JSON.stringify(newDataToLS))
      console.log(newDataToLS)
    })
  }
  add(){
      let newArr = this.state.data.map(item => item)
      newArr.push({
      name: ReactDOM.findDOMNode(this.refs.boardName).value,
      id: this.state.id++,
      tasks: []
    })
    this.setState({
      data: newArr
    })
      localStorage.setItem('data', JSON.stringify(newArr))
  }
  render(){
    return(
      <div>
        <div>
          {this.state.data.map((item,i) => (
            <Board key={item.id} id={item.id} data={item}/>
          ))}
        </div>
        <input ref='boardName' />
        <button onClick={this.add.bind(this)}>AddBoard</button>
        <p><Link to="/about" activeStyle={{ color: 'red' }}>About</Link></p>
        <p><Link to="/repos">Repos</Link></p>
        {this.props.children}
      </div>
    );
  }
}

////////////////////////////////////////////
class About extends React.Component{
  render(){
    return(
      <h1>Hi</h1>
      )
  }
}
class Repos extends React.Component{
  render(){
    return(
      <h1>Repos</h1>
      )
  }
}

////////////////////////////////////////////

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={MainApp}>
      <Route path='/repos' component={Repos} />
      <Route path='/about' component={About} />
    </Route>
  </Router>
  ,app
);

