import React, { Component } from 'react'
import axios from 'axios'
import cheerio from 'cheerio'

const TEAMS = [
    'Hawks',
    'Celtics',
    'Nets',
    'Hornets',
    'Bulls',
    'Cavaliers',
    'Mavericks',
    'Nuggets',
    'Pistons',
    'Warriors',
    'Rockets',
    'Pacers',
    'Clippers',
    'Lakers',
    'Grizzlies', 
    'Heat',
    'Bucks',
    'Timberwolves',
    'Pelicans',
    'Knicks',
    'Thunder',
    'Magic',
    '76ers',
    'Suns',
    'Blazers', 
    'Kings',
    'Spurs',
    'Raptors', 
    'Jazz',
    'Wizards'
]

function cleanTeamName(name) {
    let cleanName = name
    TEAMS.forEach((team) => {
        if ( name.search(new RegExp(team, "i")) !== -1 ) {
            cleanName = team
        }
    })
    return cleanName
}

export default class DailyGames extends Component {

    constructor(props){
        super(props);
        this.state = {
            gameData: null,
            loadedData: false,
            searchDate: null,
        }
    }

    async fetchData(searchDate){

        // CBS Sports URL
        // Base URL: https://www.cbssports.com/nba/scoreboard/
        // Date URL: https://www.cbssports.com/nba/scoreboard/20220305/
        // const test_url = 'https://www.cbssports.com/nba/scoreboard/20220305/'
        const base_url = "https://www.cbssports.com/nba/scoreboard/"
        const today_date = searchDate || new Date()
        const today_date_formatted = today_date.toISOString().slice(0, 10).replaceAll('-', '')
        const url = base_url + today_date_formatted + "/"

        // Fox Sports URL
        // Base URL: https://www.foxsports.com/scores/nba
        // Date URL: https://www.foxsports.com/scores/nba?date=2022-03-02

        // USA Today Sports URL
        // Base URL: https://sportsdata.usatoday.com/basketball/nba/scores
        // Date URL: https://sportsdata.usatoday.com/basketball/nba/scores?date=2022-03-05&season=2021-2022

        const gameData = []
        axios.get(url)
          .then((req) => {
            const $ = cheerio.load(req.data)
            $('tbody').each( function(i, tbody) {

                var parentTable = $(this).parent();
                var parentDiv = $(parentTable).parent();
                var cardDiv = $(parentDiv).parent();
                var gameStatus = $(cardDiv, 'span .game-status');
                var gameStatusText = gameStatus.text().trim()

                var children = $(this).children();
                if (children.length === 2){

                    var teamA = $(children[0]).children()
                    var teamB = $(children[1]).children()

                    if (teamA.length === 2 && teamB.length === 2) {
                        if($(teamA[0]).text().trim()){
                            
                            const data = {
                                'teamA': cleanTeamName($(teamA[0]).text().trim()),
                                'scoreA': $(teamA[1]).text().trim(),
                                'teamB': cleanTeamName($(teamB[0]).text().trim()),
                                'scoreB': $(teamB[1]).text().trim(),
                                'diff': 100,
                                'status': 'scheduled'
                            }
                            gameData.push(data)    
                        }
                    }

                    if (teamA.length === 6 && teamB.length === 6) {

                        var finalGameStatus = 'scheduled'
                        if (gameStatusText.substring(0,5) === 'FINAL'){
                            finalGameStatus = 'Final'
                        } else {
                            finalGameStatus = gameStatusText.split(' ')[0]
                        }

                        const data = {
                            'teamA': cleanTeamName($(teamA[0]).text().trim()),
                            'scoreA': parseFloat($(teamA[5]).text().trim()),
                            'teamB': cleanTeamName($(teamB[0]).text().trim()),
                            'scoreB': parseFloat($(teamB[5]).text().trim()),
                            'diff': Math.abs(parseFloat($(teamA[5]).text().trim()) -  parseFloat($(teamB[5]).text().trim())),
                            'status': finalGameStatus
                        }
                        gameData.push(data)
                    }
                }
            })

            gameData.sort(function(a,b) {
                return a.diff - b.diff
            });

            this.setState({
                gameData: gameData,
                searchDate: today_date,
                loadedData: true,
            })
          })
          .catch(function (error) {
            console.error(error);
          });
    }

    // Trigger on mount logic
    componentDidMount() {
        this.fetchData(null);
    }

    prevDate() {

        const currDate = new Date(this.state.searchDate)
        const prevDate= new Date(currDate.setDate(currDate.getDate() - 1));

        this.fetchData(prevDate)
        this.setState({
            gameData: null,
            loadedData: false,
        })
    }

    nextDate() {
        const currDate = new Date(this.state.searchDate)
        const nextDate= new Date(currDate.setDate(currDate.getDate() + 1));

        this.fetchData(nextDate)
        this.setState({
            gameData: null,
            loadedData: false,
        })
    }

    renderGames() {
        return (
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around'
                }}>

                    <button onClick={() => this.prevDate()}> &lt;&lt; </button>
                    <p> Date: {this.state.searchDate.toISOString().slice(0, 10)} </p>
                    <button onClick={() => this.nextDate()}> &gt;&gt; </button>

                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around'
                }}>
                    <table style={{
                        width: '80%'
                    }}>
                        <thead>
                            <tr>
                                <th>Team A</th>
                                <th>Team B</th>
                                <th>Score Diff</th>
                                <th>Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.gameData.map((game) => {

                                    const YOUTUBE_BASE_URL = 'https://www.youtube.com/results?search_query=nba+'
                                    const game_url = YOUTUBE_BASE_URL + `${game['teamA']}+vs+${game['teamB']}`

                                    if (game['status'] === 'scheduled') {
                                        return (
                                            <tr key={game['teamA']}>
                                                <td> {game['teamA']} </td>
                                                <td> {game['teamB']} </td>
                                                <td colSpan="2"> Scheduled </td>
                                            </tr>
                                        )
                                    } else {
                                        return (
                                            <tr key={game['teamA']}>
                                                <td> {game['teamA']} </td>
                                                <td> {game['teamB']} </td>
                                                {game['diff'] === 0 ? 
                                                    <td> It's tied! </td> :
                                                    <td> &lt; {Math.ceil(game['diff']/5)*5} pts </td> 
                                                }
                                                
                                                {game['status'] === 'Final' ? 
                                                    <td> <a href={game_url} target="_blank" rel="noreferrer"> Highlights </a> </td> :
                                                    <td> {game['status']} Quater</td>
                                                }
                                            </tr>
                                        )
                                    }
  
                                })
                            }
                        </tbody>
                    </table>
                </div>

                <div>
                    {this.state.gameData.length === 0 ? "No games finished for selected date." : ":)"}
                </div>

            </div>
        )
    }

    render() {

        return (
            <div>

                <h3> Daily Games </h3>
                
                { this.state.loadedData ? this.renderGames() : <div> Loading ... </div>}

                <button onClick={() => this.fetchData(this.state.searchDate)}> Refresh </button>
            </div>
        )
    }
}
