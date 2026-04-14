module.exports = {
  default: {
    format: ['progress-bar', 'summary'],
    paths: ['features/**/*.feature'],
    require: ['features/steps/**/*.js'],
    worldParameters: {
      baseURL: 'http://localhost:3000'
    }
  }
};
