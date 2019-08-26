import React, { Component } from 'react';
import { Card, Accordion, Button } from "react-bootstrap";
import axios from "axios";
import './App.css';
import moment from 'moment'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      cloud: []
    };
  }

  _getSearchResult = async () => {
    try {
      const response = await axios.get("http://localhost:8001/history");
      this.setState({
        history: response.data
      });
    } catch (error) {
      console.error(error);
    }
  };

  _getSearchKeywordCount = async () => {
    try {
      const response = await axios.get("http://localhost:8001/count");
      this.setState({
        cloud: response.data
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    this._getSearchResult();
    this._getSearchKeywordCount();
    return (
      <div className="App">
        <h1>Search Keyword Count</h1>
        <div className="input-group">
          {this.state.cloud.map((item, i) => (
            <ul key={i}>
              <p>{item._id} - {item.count}</p>
            </ul>
          ))}
        </div>
        <h1>Search History</h1>
        {this.state.history.map((item, i) => (
          <Accordion key={i}>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                  <p>[{i + 1}]</p>
                  <p>Search Key - {item.search}</p>
                  <p>URL - {item.url}</p>
                  <p>Search On - {moment(item.date).format('MMMM Do YYYY, h:mm:ss a')}</p>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  {item.result.map((resultItem, i) => (
                    <div key={i}>
                      <h2>{resultItem.display_name ? <a>{resultItem.display_name}</a> :
                        <a href={resultItem.svn_url} target="_blank" rel="noopener noreferrer">{resultItem.full_name}</a>
                      }</h2>
                      <div>{resultItem.created_at ? <p>Created At : {moment(resultItem.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p> : <p></p>}
                      </div>
                      <div>{resultItem.created_by ? <p>Created By : {resultItem.created_by}</p> : <p></p>}</div>
                      <div>{resultItem.short_description ? <p>Description : {resultItem.short_description}</p> : <p></p>}</div>
                      <div>{resultItem.description ? <p>Details : {resultItem.description}</p> : <p></p>}</div>
                      <div> {resultItem.forks ? <p>Forks : {resultItem.forks}</p> : <p></p>}</div>
                      <div>{resultItem.language ? <p>Language : {resultItem.language}</p> : <p></p>}</div>
                    </div>
                  ))}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        ))}

      </div>
    );
  }
}

export default App;
