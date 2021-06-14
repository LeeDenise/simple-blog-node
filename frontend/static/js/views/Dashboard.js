import AbstractView from "./AbstractView.js"

export default class extends AbstractView {
    constructor(param) {
        super(param);
        this.setTitle("Dashboard");
    }

    async getHtml() {
        return `

            <h1>Dashboard</h1>
        `;
    }
}