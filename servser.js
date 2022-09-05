const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('data.json');
const middlewares = jsonServer.defaults();
const fs = require('fs');

server.use(middlewares);

server.get('/comments/paging', async (req, res) => {
  const { limit, page } = req.query;
  fs.readFile('./data.json', 'utf-8', function (err, data) {
    if (err) throw err;
    let json = JSON.parse(data);
    const commentsCnt = json.comments.length;
    const totalPage = Math.ceil(commentsCnt / limit);
    res.jsonp({
      totalPage,
      page: parseInt(page),
      limit: parseInt(limit),
      commentsCnt,
    });
  });
});

server.get('/result/statistics', async (req, res) => {
  // const {type} = req.params;
  fs.readFile('./data.json', 'utf-8', function (err, data) {
    if (err) throw err;
    let {results} = JSON.parse(data);
    const listByAmount = results.reduce((pre, curr)=> {
      pre[curr.amount] = pre[curr.amount]? [...pre[curr.amount], curr]:[curr];
      return pre;
    },{});
    const returnVal = Object.keys(listByAmount).sort((a, b)=> a - b).map((key)=>{
      const {name, easy, medium, hard, easyAnswer, mediumAnswer, hardAnswer} = listByAmount[key].reduce((pre, curr)=>{
        pre[curr.difficulty] += parseInt(key);
        pre[curr.difficulty+'Answer'] += curr.answer;
        return pre;
      }, {name: key, easy: 0, medium: 0, hard: 0, easyAnswer: 0, mediumAnswer: 0, hardAnswer: 0});
      return {name, easy: (easy?easyAnswer/easy:0).toFixed(2)*100, medium: (medium?mediumAnswer/medium:0).toFixed(2)*100, hard: (hard?hardAnswer/hard:0).toFixed(2)*100};
    });

    res.jsonp({statistics:returnVal});
  });
});

server.use(router);
server.listen(80, () => {
  console.log('JSON Server is running');
});
