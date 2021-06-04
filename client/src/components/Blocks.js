import React, {Component} from 'react';
import { Link } from 'react-router-dom';

import Block from './Block';
class Blocks extends Component {
    state = {blocks :[]};
    componentDidMount() {
        fetch(`${document.location.origin}/api/blocks`)
            .then(response =>response.json())
            .then((res)=>{
                this.setState({blocks : res.Blockchain});
                console.log(this.state);
            });
    };

    render(){
        return (
            <div>
                <div>
                    <Link to="/">
                        Home
                    </Link>
                </div>
                <br />
                <h3>Blocks</h3>
                {
                    this.state.blocks.map((block) => {
                        return (
                            <div>
                                {/* <div className="Block" key={block.hash}>{block.hash}</div> */}
                                <Block key={block.hash} block = {block} ></Block>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

}

export default Blocks;