var api=require("./radioForNode");
var a=100;

var runner=new api.Runner("127.0.0.1",5521,function()
{
    runner.run({delegation: function(x)
                {
                    mm.load("CollectionHunter","5734106b9321fb70389217cd").getCollectionInfo(function(err,list)
                    {
                        if (err)
                        {
                            return callback({error: true,content: err.message});
                        }
                        callback({error: false,list: list});
                    });
                },
                callback: function(info)
                {
                    console.log(info);
                },
                error: function(ecode,e){console.log(e.stack);},
                parameters: a});

},function(e)
{
    console.log(e);
});


// api.testServer("127.0.0.1",5521,function(isOK)
// {
//     console.log(isOK);
// });
