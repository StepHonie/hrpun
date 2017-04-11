var net=require("tls");


function Runner(host,port,ready,localError)
{
    var nextPacketID=(new Date).getTime();
    var bizQueue=new Array;
    var socket=net.connect({host: host,port: port,rejectUnauthorized: false},function()
    {
        var buff=new Buffer(0);
        function PacketCutter()
        {
            if (buff.length<4)
            {
                return;
            }
            var plen=buff.readUInt32BE(0);
            if (buff.length<plen)
            {
                return;
            }
            var pack=buff.slice(0,plen);
            buff=buff.slice(plen);
            var json=pack.slice(4).toString();
            try
            {
                json=JSON.parse(json);
            }
            catch (e)
            {
                process.nextTick(PacketCutter);
                return;
            }
            var id=json.id;
            for (var i=0;i<bizQueue.length;i++)
            {
                if (bizQueue[i].id==id)
                {
                    if (json.error)
                    {
                        var t=json.content.stack;
                        if (t)
                        {
                            t=t.replace(/evalmachine\.<anonymous>/g,"delegation code");
                            json.content.stack=t;
                        }
                        process.nextTick(bizQueue[i].error,json.errCode,json.content);
                    }
                    else
                    {
                        process.nextTick(bizQueue[i].callback,json.content);
                    }
                    bizQueue.splice(i,1);
                    break;
                }
            }
            process.nextTick(PacketCutter);
        }
        socket.on("data",function(chunk)
        {
            buff=Buffer.concat([buff,chunk]);
            PacketCutter();
        });
        process.nextTick(ready);
    });
    socket.on("error",function(e)
    {
        localError(e);
    });
    this.run=function(o)
    {
        o.id=nextPacketID++;
        var f=o.delegation;
        if (typeof(f)!="function")
        {
            throw {message: "delegation must be a function!"};
        }
        if (typeof(o.error)!="function")
        {
            o.error=function(){};
        }
        if (typeof(o.callback)!="function")
        {
            throw {message: "callback must be a function!"};
        }
        f=f.toString();
        var pack={id: o.id,delegation: f,handler: "Sensia.superRunner",parameters: o.parameters};
        pack=new Buffer(JSON.stringify(pack));
        pack=Buffer.concat([new Buffer(4),pack]);
        pack.writeUInt32BE(pack.length,0);
        bizQueue.push(o);
        socket.write(pack);
    };
}

function TestServer(host,port,callback)
{
    var socket=net.connect({host: host,port: port,rejectUnauthorized: false},function()
    {
        var ran=Math.random();
        ran*=1000;
        ran=parseInt(ran);
        socket.on("data",function(chunk)
        {
            var pack=chunk.slice(4).toString();
            try
            {
                var json=JSON.parse(pack);
                if (json.content.v==ran^17)
                {
                    process.nextTick(callback,true);
                }
                else
                {
                    process.nextTick(callback,false);
                }
            }
            catch (e)
            {
                process.nextTick(callback,false);
            }
            socket.end();
        });
        var j={handler: "Sensia.connectionTest",v: ran};
        var buf=new Buffer(JSON.stringify(j));
        buf=Buffer.concat([new Buffer(4),buf]);
        buf.writeUInt32BE(buf.length,0);
        socket.write(buf);
    });
    socket.on("error",function(e)
    {
        process.nextTick(callback,false);
    });
}


module.exports={Runner: Runner,
                testServer: TestServer};
