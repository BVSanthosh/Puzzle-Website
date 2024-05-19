import React from 'react';
import styles from '../styles/sudoku.module.css';
// import FileReader from 'filereader';

class UploadPuzzle extends React.Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fileInput = React.createRef();
    }

    render() {
        return (
            <div className={styles.create_upload}>
            <form onSubmit={this.handleSubmit}>
                <input class="btn btn-light" style = {{ margin: 20}} type="file" ref={this.fileInput} multiple/>
                <br/>
                <button class="btn btn-primary" type="submit">Upload</button>
            </form>
            </div>
          );
    }

    handleSubmit(event) {
        event.preventDefault();
        if(this.fileInput.current.files[0] == null) {
            alert("No file selected");
            return;
        }
        for(let i = 0; i < this.fileInput.current.files.length; i++) {
            let reader = new FileReader();
            reader.readAsText(this.fileInput.current.files[i]);
            reader.onload = () => {
                this.savePuzzle(reader.result);
            }
        }
    }

    // Save a puzzle to the database.
    savePuzzle(input) {
        const puzzle = {
            method: "POST",
            body: input
        }
        fetch("/api/puzzles/write/", puzzle)
            .then((res) => {if(res.status==200) alert("Saved Puzzle"); return res.json()})
            .then((data) => console.log(data));
    }

}

export default UploadPuzzle