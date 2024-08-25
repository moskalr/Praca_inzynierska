import axios from "axios";

const apiBaseURL = "http://account-microservice:8090";

export default axios.create({
  baseURL: apiBaseURL,
});
