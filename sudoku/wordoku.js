import React, { createElement } from 'react';
import styles from '../styles/sudoku.module.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2'

// import { store_puzzle } from '../database';

function Tile(props) {
    return (
        <div className={styles.cell}>
            <input
                type="text"
                value={props.value}
                className={ props.mistake ?
                    props.disabled ? styles.tile_disabled_mistake : styles.tile_abled_mistake :
                    props.disabled ? styles.tile_abled : styles.tile_disabled
                }
                maxLength={1}
                size={1}
                mistake={props.mistake}
                onChange={(e) => {props.onChange(props.c, props.r, e)}}
                disabled={props.disabled}
            />
        </div>
    );
}

class Board extends React.Component {
    renderTile(c, r, i, d) {
        return (
            <Tile
                c={c}
                r={r}
                value={this.props.board[c][r]}
                onChange={(c, r, i) => this.props.onChange(c, r, i)}
                disabled={d != null && d != "" && d != " "}
                mistake={this.props.mistakes.includes(c + ":" + r)}
            />
        );
    }
    renderRow(a, b) {
        return (
            <div className={styles.sudokuColumn}>
                    {this.renderTile(a, b, this.props.board[a][b], this.props.startBoard[a][b])}
                    {this.renderTile(a+1, b, this.props.board[a+1][b], this.props.startBoard[a+1][b])}
                    {this.renderTile(a+2, b, this.props.board[a+2][b], this.props.startBoard[a+2][b])}
            </div>
        );
    }s

    renderColumn(a, b) {
        return (
            <div className={styles.sudokuRow}>
                {this.renderRow(a, b)}
                {this.renderRow(a, b+1)}
                {this.renderRow(a, b+2)}
            </div>
        );
    }

    render() {
        return (
            <div className={styles.sudokubloc}>
                {this.renderColumn(0, 0)}
                {this.renderColumn(0, 3)}
                {this.renderColumn(0, 6)}
                {this.renderColumn(3, 0)}
                {this.renderColumn(3, 3)}
                {this.renderColumn(3, 6)}
                {this.renderColumn(6, 0)}
                {this.renderColumn(6, 3)}
                {this.renderColumn(6, 6)}
            </div>
        );
    }
}

class Wordoku extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.puzzle == null) { // no puzzle given
            this.state = {
                board: new Array(9).fill(new Array(9).fill(null)),
                startBoard: new Array(9).fill(new Array(9).fill(null)),
                difficulty: null,
                name: null,
                author: this.props.author,
                createMode: true,
                word: null,
                mistakes: [],
                solved: false
            }
        }
        else { // puzzle given
            this.state = {
                board: props.puzzle.data.puzzle,
                startBoard: props.puzzle.data.puzzle,
                difficulty: props.puzzle.data.difficulty,
                createMode: false,
                mistakes: [],
                word: props.puzzle.data.word,
                solved: false,

                id: props.puzzle.id,
                name: props.puzzle.name,
                author: props.puzzle.author,
                solution: props.puzzle.data.solution
            }
        }
    }
    
    handleChange(c, r, event) {
        // Prevent editing a starting value
        if(this.state.startBoard[c][r] != null && this.state.startBoard[c][r] != "" && this.state.startBoard[c][r] != " ") return;

        let value = event.target.value;
        console.log("update c" + c + " r" + r + " val" + value);
        let tempArr = [];
        for(let i = 0; i < this.state.board.length; i++) { // Make a copy of the board to edit.
            tempArr.push(this.state.board[i].slice());
        }

        // Reset square to null if value removed.
        if(value == "" || value == null || value == " " || this.state.word == null || !this.state.word.includes(value)) { 
            tempArr[c][r] = "";
        } else if(value.length<=1 && this.state.word != null && this.state.word.includes(value)) { // If letter in word
            tempArr[c][r] = value;
        }

        if(this.state.createMode) this.state.solution = null; // If creating a puzzle ensure that is must be revalidated
        
        this.state.board = tempArr;
        let solved = this.validatePuzzle(tempArr);
        if(solved && !this.state.createMode && !this.state.solved) {

            fetch("/api/level_up", {
                method: "POST",
                body: JSON.stringify({user_id: this.props.user_id, puzzle_id: this.props.puzzle_id}),
                headers: { 'Content-Type': 'application/json' }
            });

            this.state.solved = true;
            this.alertSolve();
        }
        console.log("solved: " + solved);
    }

    alertSolve() {
        Swal.fire({
            icon: 'success',
            title: 'Good job!',
            text: 'you solved this wordoku',
            showCancelButton: true,
            cancelButtonText: `return`,
            confirmButtonText: '<a style="text-decoration:none; color:white" href="../puzzle-list/wordoku">solve another</a>',
        })
    }

    // Change word when creating puzzle
    handleWordChange(event) {
        let value = event.target.value;
        console.log("Word: " + value);
        this.state.word = value;
    }

    // Save button
    handleClick() {
        this.savePuzzle();
    }

    // Solve button
    handleSolve() {
        console.log("validating board")
        let tempBoard = this.puzzleSolver(this.state.board);
        if (tempBoard != null && tempBoard != "invalid") {
            this.state.solution = tempBoard;
            this.findMistakes(this.state.board);
            alert("Validated Wordoku")
        }
        else {
            console.log(tempBoard);
            this.findMistakes(this.state.board);
            alert("Invalid Wordoku: must have exactly 1 solution");
        }
    }

    // Setting name
    handleName(event) {
        let value = event.target.value;
        console.log("Name: " + value);
        this.state.name = value;
    }

    // Setting difficulty
    handleDifficulty(event) {
        let value = {"Easy": 3, "Medium": 5, "Hard": 7}[event.target.value];
        console.log("Difficulty: " + value);
        this.state.difficulty = value;
    }

    render() {
        return(
            <div>
                    {this.state.createMode ? " ": 
                        <div className={styles.title}>
                            {this.props.puzzle.name}
                        </div> }

                    {this.state.createMode ? " ": 
                        <div className={styles.description}>
                            Difficulty: {{3: "Easy", 5: "Medium", 7: "Hard"}[this.props.puzzle.difficulty]}
                        </div> }
                    
                    {this.state.createMode ? " " :
                        <div className={styles.description} style={{color: (this.props.votes < 0 ? "blue" : "orange"), fontWeight: "bolder"}}>
                            {`${JSON.stringify(this.props.votes)} ${this.props.votes < 0 ? "🠗" : "🠕"}`}
                        </div>
                    }
                        
                    <Board
                        board={this.state.board}
                        startBoard={this.state.startBoard}
                        onChange={(c, r, i) => this.handleChange(c, r, i)}
                        mistakes={this.state.mistakes}
                    />

                    {this.state.createMode ?
                        <div>
                            <button className={styles.button} onClick={() => this.handleSolve()}>Validate Wordoku</button>
                        </div>
                        : " "}

                    <div className={styles.create_save}>

                        {this.state.createMode ?
                            <div style={{color: "#000000"}}>
                                Name: 
                                <input
                                        type="text"
                                        maxLength={30}
                                        size={10}
                                        onChange={(i) => {this.handleName(i)}}
                                    />
                            </div> : " "
                        }

                        {this.state.createMode ?
                            <Form.Select className={styles.difficulty_dropdown} aria-label="Default select example" value = {this.state.value} onChange={(i) => this.handleDifficulty(i)}>
                                <option>Select difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </Form.Select> : " "}
                            <div style={{color: "#000000"}}>
                                Word: 
                                {this.state.createMode ?
                                    <input
                                        type="text"
                                        maxLength={9}
                                        minLength={9}
                                        size={9}
                                        onChange={(i) => {this.handleWordChange(i)}}
                                    />
                                    : this.state.word
                                }
                            </div>
                        <br></br>
                        {this.state.createMode ? <Button variant="primary" onClick={() => this.handleClick()}>Save Wordoku</Button> : ""}
                    </div>

                    {this.state.createMode ? "" : <div> {this.downloadPuzzle()} </div>}
            </div>
        );
    }

    // Check whether the wordoku is solved.
    validatePuzzle(board) {
        if(this.findMistakes(board).length == 0) {
            for(let c = 0; c<board.length; c++) {
                for(let r = 0; r<board.length; r++) {
                    if(board[c][r] == null || board[c][r] == "" || board[c][r] == " ") {
                        return false;
                    }
                }
            }
        return true;
        }
    }

    findMistakes(board) {
        let tempMistakes = [];
        // let board = this.state.board;
        for(let c = 0; c<board.length; c++) {
            for(let r = 0; r<board.length; r++) {

                if(board[c][r] == null || board[c][r] == "") {
                    continue;
                }
                else if(this.state.word == null || this.state.word == "" || !this.state.word.includes(board[c][r])) {
                    tempMistakes.push(c + ":" + r);
                }
    
                // Check column and row
                for(let i = 0; i<board.length; i++) {
                    if(i != r && board[c][i] == board[c][r]) {
                        tempMistakes.push(c + ":" + i);
                        tempMistakes.push(c + ":" + r);
                    }
                    if(i != c && board[i][r] == board[c][r]) {
                        tempMistakes.push(i + ":" + r);
                        tempMistakes.push(c + ":" + r);
                    }
                }
                // Check subgrid
                let subC, subR;
                if(r<=2) {
                    subR = 0;
                } else if(r<=5) {
                    subR = 3;
                } else {
                    subR = 6;
                }
                if(c<=2) {
                    subC = 0;
                } else if(c<=5) {
                    subC = 3;
                } else {
                    subC = 6;
                }
                for(let m = 0; m<3; m++) {
                    for(let n = 0; n<3; n++) {
                        if( !(m+subC == c && n+subR == r) && board[m+subC][n+subR] == board[c][r]) {
                            tempMistakes.push((m+subC) + ":" + (n+subR));
                            tempMistakes.push(c + ":" + r);
                        }
                    }
                }
    
    
            }
        }
        this.setState({mistakes: tempMistakes});
        return tempMistakes;
    }

    // Solve the given puzzle, or return null if no solution exists.
    puzzleSolver(board) {
        if(this.state.word == null || this.state.word.length != 9) return null;

        let tempBoard = [] // copy board
        let tempSolution = null // for storing a solution in case multiple are found
        for(let i = 0; i < board.length; i++) {
            tempBoard.push(board[i].slice());
        }

        if(this.findMistakes(tempBoard).length > 0) return null;

        for (let c = 0; c < tempBoard.length; c++) {
            for (let r = 0; r < tempBoard.length; r++) {
                if (tempBoard[c][r] == null) {
                    for (let i = 0; i <= 8; i++) {
                        tempBoard[c][r] = this.state.word.charAt(i);
                        let temp = this.puzzleSolver(tempBoard);
                        if (temp == "invalid") return "invalid";
                        if (temp != null && tempSolution != null) return "invalid";
                        if (temp != null) tempSolution = temp;
                    }
                    return tempSolution;
                }
            }
        }
        return tempBoard;
    }

    // Prepare a javascript object representing the puzzle matching the defined format.
    async prepareExport() {
        let puzzle = null;
        if (this.props.puzzle == null) {
            
            const user = {
                method: "GET"
            }
            let tempAuthor = await fetch("/api/users/" + this.props.author, user)
                .then((res) => res.json())

            puzzle = {
                id: this.state.id,
                name: this.state.name,
                variant: "wordoku",
                data: {
                    puzzle: this.state.createMode ? this.state.board : this.state.startBoard,
                    solution: this.state.solution,
                    word: this.state.word
                },
                author: tempAuthor,
                difficulty: this.state.difficulty
            }
        } else {
            puzzle = this.props.puzzle;
        }
        return puzzle;
    }

    // Save a puzzle to the database.
    savePuzzle() {
        console.log("Saving...")
        if(this.state.word == null || this.state.word.length != 9) {
            alert("No Word");
            return;
        }
        if(
            this.state.createMode
            && (this.findMistakes(this.state.board).length != 0
                || this.puzzleSolver(this.state.board) == null)
            ) {
            alert("Must validate puzzle before saving");
            this.findMistakes(this.state.board);
            return;
        }

        // Check that puzzle has been validated (requires a solution)
        if(this.state.solution == null) {
            alert("Must validate puzzle before saving");
            this.findMistakes(this.state.board);
            return;
        }

        this.findMistakes(this.state.board);

        this.prepareExport().then((i) => {
        const puzzle = {
            method: "POST",
            body: JSON.stringify(i)
        }
        fetch("/api/puzzles/write/", puzzle)
            .then((res) => { if(res.status == 200) alert("Saved Puzzle"); return res.json()})
            .then((data) => console.log(data));
        })
    }

    // Download a puzzle
    downloadPuzzle() {
        let puzzle = this.props.puzzle;
        puzzle.id = puzzle._id;
        return createElement(
            'a',
            {
                href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(puzzle)),
                download: 'puzzle.json'
            },
            'Download Puzzle'
        );
    }

}

export default Wordoku