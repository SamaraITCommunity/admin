import request from "supertest";
import App from '../src/app';

const app = new App();
const expressApp = app.run();

describe("Test the root path", () => {
    test("It should response the 200", done => {
        request(expressApp)
            .get("/")
            .then((response) => {
                expect(response.status).toBe(200);
                done();
            });
    });
});

describe("Test the queue path", () => {
    test("It should response the list of tasks", done => {
        request(expressApp)
            .get("/queue")
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toBeDefined();
                done();
            });
    });
});