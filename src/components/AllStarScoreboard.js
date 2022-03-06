import React, { Component } from 'react'
import axios from 'axios'
import cheerio from 'cheerio'
import { TEAM_HAYDEN, TEAM_PERU } from './hardcoded_teams';
import './main.css'

export default class AllStarScoreboard extends Component {

  constructor(props){
    super(props);
    this.state = {
        dataArr: null,
        loadedData: false,
        aggValuesPeru: null,
        aggValuesHayden: null,
        processedData: false
    }
  }

  async fetchData() {

    const url = "https://www.espn.com/nba/boxscore/_/gameId/401410564"

    const dataArr = []

    axios.get(url)
      .then((req) => {
        const $ = cheerio.load(req.data)
        $('tr').each( function(i, tr) {
          var children = $(this).children();
          if (children.length === 15) {
            var data = {
              'Name': $(children[0]).text().trim(),
              'Min': $(children[1]).text().trim(),
              'FG': $(children[2]).text().trim(),
              '3PT': $(children[3]).text().trim(),
              'FT': $(children[4]).text().trim(),
              'OREB': $(children[5]).text().trim(),
              'DREB': $(children[6]).text().trim(),
              'REB': $(children[7]).text().trim(),
              'AST': $(children[8]).text().trim(),
              'STL': $(children[9]).text().trim(),
              'BLK': $(children[10]).text().trim(),
              'TO': $(children[11]).text().trim(),
              'PF': $(children[12]).text().trim(),
              '+/-': $(children[13]).text().trim(),
              'PTS': $(children[14]).text().trim(),
            }
            dataArr.push(data)
          }
        })
        this.processData(dataArr)
      })
      .catch(function (error) {
        console.error(error);
      });

  }

  async processData(dataArr) {

    //clean values
    const cleanerData = []
    dataArr.forEach(element => {

      const excludeElementNAmes = ['Starters', 'Bench', 'TEAM', '']

      if (!excludeElementNAmes.includes(element['Name'])){
        const newElement = {
          'name': element['Name'].split(' ')[2],
          'PTS': parseInt(element['PTS']),
          '3PT': parseInt(element['3PT'].split('-')[0]),
          'REB': parseInt(element['REB']),
          'AST': parseInt(element['AST']),
          'STL+BLK': parseInt(element['STL'])+parseInt(element['BLK']),
        }
        cleanerData.push(newElement);
      }
    });


    //sort values
    const PERU_TEAM = []
    const HAYDEN_TEAM = []

    cleanerData.forEach(element => {

      TEAM_HAYDEN.forEach(player => {
        if (element['name'].includes(player)){
          HAYDEN_TEAM.push(element)
        }
      })

      TEAM_PERU.forEach(player => {
        if (element['name'].includes(player)){
          PERU_TEAM.push(element)
        }
      })
      
    })

    //aggregate values
    const aggValuesPeru = {
      'PTS': 0,
      '3PT': 0,
      'REB': 0,
      'AST': 0,
      'STL+BLK': 0,
    }
    PERU_TEAM.forEach(data => {
      aggValuesPeru['PTS'] += data['PTS']
      aggValuesPeru['3PT'] += data['3PT']
      aggValuesPeru['REB'] += data['REB']
      aggValuesPeru['AST'] += data['AST']
      aggValuesPeru['STL+BLK'] += data['STL+BLK']
    })

    const aggValuesHayden = {
      'PTS': 0,
      '3PT': 0,
      'REB': 0,
      'AST': 0,
      'STL+BLK': 0,
    }
    HAYDEN_TEAM.forEach(data => {
      aggValuesHayden['PTS'] += data['PTS']
      aggValuesHayden['3PT'] += data['3PT']
      aggValuesHayden['REB'] += data['REB']
      aggValuesHayden['AST'] += data['AST']
      aggValuesHayden['STL+BLK'] += data['STL+BLK']
    })

    this.setState({
      aggValuesHayden: aggValuesHayden,
      aggValuesPeru: aggValuesPeru,
      dataPeru: PERU_TEAM,
      dataHayden: HAYDEN_TEAM,
      dataArr: dataArr,
      loadedData: true,
    })

  }
  
  // Trigger on mount logic
  componentDidMount() {
    this.fetchData();
  }

  renderCoolThing(idx, peru_val, hayden_val) {

    if (peru_val > hayden_val) {
      return (
        <tr>
          <td>{idx}</td>
          <td style={{color: 'green'}}>{peru_val}</td>
          <td>{hayden_val}</td>
        </tr>
      )  
    } else if (peru_val < hayden_val) {
      return (
        <tr>
          <td>{idx}</td>
          <td>{peru_val}</td>
          <td style={{color: 'green'}}>{hayden_val}</td>
        </tr>
      )  
    } else {
      return (
        <tr>
          <td>{idx}</td>
          <td>{peru_val}</td>
          <td>{hayden_val}</td>
        </tr>
      )  
    }

  }

  renderTableData(data) {
      return data.map((player, index) => {
        return (
            <tr key={player['name']}>
              <td>{index}</td>
              <td>{player['name']}</td>
              <td>{player['3PT']}</td>
              <td>{player['REB']}</td>
              <td>{player['AST']}</td>
              <td>{player['STL+BLK']}</td>
              <td>{player['PTS']}</td>
            </tr>
        )
      })
  }

  renderResults() {

    const aggValuesPeru = this.state.aggValuesPeru
    const aggValuesHayden = this.state.aggValuesHayden

    const dataPeru = this.state.dataPeru
    const dataHayden = this.state.dataHayden
    
    return (
      <div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>Peru</th>
                  <th>Hayden</th>
                </tr>
              </thead>
              <tbody>
                {this.renderCoolThing('3PT', aggValuesPeru['3PT'], aggValuesHayden['3PT'])}
                {this.renderCoolThing('REB', aggValuesPeru['REB'], aggValuesHayden['REB'])}
                {this.renderCoolThing('AST', aggValuesPeru['AST'], aggValuesHayden['AST'])}
                {this.renderCoolThing('STL+BLK', aggValuesPeru['STL+BLK'], aggValuesHayden['STL+BLK'])}
                {this.renderCoolThing('PTS', aggValuesPeru['PTS'], aggValuesHayden['PTS'])}
              </tbody>
          </table>
        </div>

        <br />
        <br />
        <br />

        <div style={{
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <table>
            <caption>Peru's Team</caption>
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>3PT</th>
                <th>REB</th>
                <th>AST</th>
                <th>STL+BLK</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {this.renderTableData(dataPeru)}
            </tbody>
          </table>

          <table>
            <caption>Hayden's Team</caption>
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>3PT</th>
                <th>REB</th>
                <th>AST</th>
                <th>STL+BLK</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {this.renderTableData(dataHayden)}
            </tbody>
          </table>
        </div>

      </div>
    )
  }
 
  render() {

    if (this.state.loadedData) {
      return (
        <div>

          <h3> 
            A Win in a Win :) 
          </h3>

          <br />

          {this.renderResults()}

          <br />
          <br />

          <button onClick={() => this.fetchData()}> Refresh </button>

          <h1>
            Some potential options:
          </h1>
          <ul>
            <li><a href='https://www.youtube.com/watch?v=M11SvDtPBhA&ab_channel=HollywoodRecordsVEVO' target="_blank" rel="noreferrer"> Party in the USA </a></li>
            <li><a href='https://www.youtube.com/watch?v=QGJuMBdaqIw&ab_channel=KatyPerryVEVO' target="_blank" rel="noreferrer"> Firework </a></li>
            <li><a href='https://www.youtube.com/watch?v=tAp9BKosZXs&ab_channel=KatyPerryVEVO' target="_blank" rel="noreferrer"> I Kissed a Girl</a></li>
            <li><a href='https://www.youtube.com/watch?v=kffacxfA7G4&ab_channel=JustinBieberVEVO' target="_blank" rel="noreferrer"> Baby </a></li>
          </ul>
        </div>
      )
    }

    return (
      <div>
        <h3> Loading ... </h3>
        <button onClick={() => this.fetchData()}> Refresh </button>
      </div>
    )
  }
}
