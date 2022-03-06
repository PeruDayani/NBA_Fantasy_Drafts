import React, { Component } from 'react'
import AllStarScoreboard from './AllStarScoreboard'
import DailyGames from './DailyGames';
import './main.css'

export default class main extends Component {

  constructor(props){
    super(props);
    this.state = {
      dailyGames: true
    }
  }

  switchView() {
    this.setState({
      dailyGames: !this.state.dailyGames
    })
  }

  render() {
    if (this.state.dailyGames) {
      return (
        <div>
          <button onClick={() => this.switchView()}> All Star Scoreboard </button>
          <DailyGames />
        </div>
      )
    } else {
      return (
        <div>
          <button onClick={() => this.switchView()}> Daily Games </button>
          <AllStarScoreboard />
        </div>
      )
    }
  }
}
