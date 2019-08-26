import React, { Component } from "react";
import "./App.css";
import {
  InputGroup,
  FormControl,
  Button,
  Jumbotron,
  Container
} from "react-bootstrap";
import axios from "axios";
import moment from 'moment';

let response = {};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      result: [],
      total_count: 0,
      per_request: 10,
      pages: 0,
      current_page: 1,
      searchby: "topics",
      selectedLanguage: "Assembly"
    };
  }

  _handleTextChange = e => {
    this.setState({ text: e.target.value });
  };

  _setLanguage = event => {
    this.setState({ selectedLanguage: event.target.value });
  };

  _handlePageChange = async pageNumber => {
    await this.setState({
      current_page: pageNumber,
      repos: []
    });
    this._getSearchResult();
  };

  _handleKeyPress = target => {
    if (target.key === "Enter") {
      this._handleSearch(target);
    }
  };

  _handleSearch = e => {
    e.preventDefault();
    if (!this.state.text.length) {
      return;
    }
    this._getSearchResult();
  };

  _getSearchResult = async () => {
    try {
      if (this.state.searchby === "topics") {
        response = await axios.get(
          `https://api.github.com/search/topics?q=${this.state.text}+is:featured&page=${this.state.current_page}&&per_page=${this.state.per_request}`,
          {
            headers: {
              Accept: "application/vnd.github.mercy-preview+json",
              "Content-Type": "application/json"
            }
          }
        );
      } else if (this.state.searchby === "language") {
        response = await axios.get(
          `https://api.github.com/search/repositories?q=${this.state.text}+language:${this.state.selectedLanguage}&page=${this.state.current_page}&&per_page=${this.state.per_request}`
        );
      }
      const noOfPages = Math.ceil(
        response.data.total_count / this.state.per_request
      );
      this._saveToHistory(
        this.state.text,
        response.config.url,
        response.data.items
      );
      this.setState({
        total_count: response.data.total_count,
        pages: noOfPages,
        result: response.data.items
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  _saveToHistory = (search, url, result) => {
    axios
      .post("http://localhost:8001/history", {
        search: search,
        url: url,
        date: Date.now(),
        result: result
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  render() {
    let renderPageNumbers;
    const pageNumbers = [];
    if (this.state.total_count !== null) {
      for (let i = 1; i <= this.state.pages; i++) {
        pageNumbers.push(i);
      }

      renderPageNumbers = pageNumbers.map(number => {
        let classes =
          this.state.current_page === number ? "success" : "outline-success";

        return (
          <Button
            key={number}
            variant={classes}
            onClick={() => this._handlePageChange(number)}
          >
            {number}
          </Button>
        );
      });
    }
    return (
      <div style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }}>
        <InputGroup>
          <FormControl
            placeholder="Github repositories"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            onChange={e => this._handleTextChange(e)}
            value={this.state.text}
            onKeyPress={target => this._handleKeyPress(target)}
          />
          <InputGroup.Append>
            <Button
              variant="outline-secondary"
              onClick={e => this._handleSubmit(e)}
            >
              Search
            </Button>
          </InputGroup.Append>
        </InputGroup>
        <div style={{ marginTop: 20 }}>
          <InputGroup>
            <input
              type="radio"
              name="radio-group"
              value="1"
              onChange={() => this.setState({ searchby: "topics" })}
              defaultChecked
            />
            <p>Topic</p>
            <input
              type="radio"
              name="radio-group"
              value="2"
              onChange={() => this.setState({ searchby: "language" })}
            />
            <p>Language</p>
            {this.state.searchby === "language" ? (
              <select
                id="lang"
                onChange={e => this._setLanguage(e)}
                value={this.state.selectedLanguage}
              >
                <option value="Assembly">Assembly</option>
                <option value="Python">Python</option>
                <option value="C">C</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="R">R</option>
                <option value="Javascript">Javascript</option>
                <option value="Go">Go</option>
                <option value="Swift">Swift</option>
                <option value="Ruby">Ruby</option>
              </select>
            ) : (
                <p> </p>
              )}
          </InputGroup>
        </div>
        <div className="input-group">
          <p>Total Count = {this.state.total_count} </p>
          <p style={{ marginLeft: 20 }}>
            Per Request = {this.state.per_request}{" "}
          </p>
          <p style={{ marginLeft: 20 }}> Total Pages = {this.state.pages} </p>
        </div>
        <ul>
          {this.state.result.map((item, i) => (
            <Jumbotron fluid key={i}>
              <Container>
                <h2>{item.display_name ? <a>{item.display_name}</a> :
                  <a href={item.svn_url} target="_blank" rel="noopener noreferrer">{item.full_name}</a>
                }</h2>
                <div>{item.created_at ? <p>Created At : {moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p> : <p></p>}
                </div>
                <div>{item.created_by ? <p>Created By : {item.created_by}</p> : <p></p>}</div>
                <div>{item.short_description ? <p>Description : {item.short_description}</p> : <p></p>}</div>
                <div>{item.description ? <p>Details : {item.description}</p> : <p></p>}</div>
                <div> {item.forks ? <p>Forks : {item.forks}</p> : <p></p>}</div>
                <div>{item.language ? <p>Language : {item.language}</p> : <p></p>}</div>
              </Container>
            </Jumbotron>
          ))}
        </ul>
        {renderPageNumbers}
      </div>
    );
  }
}

export default App;
