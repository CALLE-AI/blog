// TurnBench Interruption snapshot: October 15, 2026. Source: https://turnbench.sesame.com/
(()=>{
    const root=document.getElementById('recall-fpr-layout'),host=root.querySelector('.rf-main'),tip=root.querySelector('.rf-tooltip'),access=root.querySelector('.rf-access');
    const allData=[{"name": "AI Rudder Helm Swift", "label": "Helm Swift", "recall": 93.8, "fpr": 4.8, "kind": "swift", "latency": 1049}, {"name": "AI Rudder Helm Bearing", "label": "Helm Bearing", "recall": 90.7, "fpr": 5.1, "kind": "bearing", "latency": 1434}, {"name": "SPX-AI MicroCF", "label": "SPX-AI MicroCF", "recall": 98.4, "fpr": 7.3, "latency": 747}, {"name": "p99lab turn-1-mini", "label": "p99lab turn-1-mini", "recall": 97.3, "fpr": 4.8, "latency": 551}, {"name": "Ooma Turn Detector", "label": "Ooma", "recall": 96.8, "fpr": 7.6, "latency": 567}, {"name": "Vox Maru v1", "label": "Vox Maru", "recall": 96.4, "fpr": 8.5, "latency": 368}, {"name": "Tavus Sparrow-2", "label": "Tavus Sparrow-2", "recall": 95.8, "fpr": 12.6, "latency": 959}, {"name": "VoxTurn", "label": "VoxTurn", "recall": 95.1, "fpr": 11.2, "latency": 332}, {"name": "Voice Activity Projection", "label": "VAP", "recall": 94.5, "fpr": 10.7, "baseline": true, "latency": 994}, {"name": "Neosapience Nunchi v1 (Single-Channel)", "label": "Nunchi (SC)", "recall": 93.9, "fpr": 4.9, "latency": 666}, {"name": "Zero Runtime Echo Omni", "label": "Echo Omni", "recall": 90.4, "fpr": 12.9, "latency": 698}, {"name": "Mimi Endpointer", "label": "Mimi Endpointer", "recall": 89.9, "fpr": 10.6, "baseline": true, "latency": 1007}, {"name": "Neosapience Nunchi v1 (Dual-Channel)", "label": "Nunchi (DC)", "recall": 89.9, "fpr": 7.8, "latency": 1027}, {"name": "Kyutai Semantic VAD", "label": "Kyutai Semantic VAD", "recall": 89.8, "fpr": 8.1, "baseline": true, "latency": 559}, {"name": "WavLM Large Anchor", "label": "WavLM Large Anchor", "recall": 86.8, "fpr": 5.4, "baseline": true, "latency": 1412}, {"name": "WavLM Base Causal", "label": "WavLM Base Causal", "recall": 82.0, "fpr": 11.1, "baseline": true, "latency": 580}, {"name": "WavLM Large Causal", "label": "WavLM Large Causal", "recall": 63.7, "fpr": 9.4, "baseline": true, "latency": 832}, {"name": "ESPnet Turntaking Perchannel", "label": "ESPnet (Perchannel)", "recall": 61.1, "fpr": 13.5, "baseline": true, "latency": 859}, {"name": "ESPnet Turntaking", "label": "ESPnet Turntaking", "recall": 57.3, "fpr": 8.0, "baseline": true, "latency": 210}, {"name": "Smart Turn v3", "label": "Smart Turn v3", "recall": 10.7, "fpr": 9.3, "baseline": true, "latency": 159}, {"name": "OpenAI Realtime (Semantic VAD)", "label": "OpenAI Semantic VAD", "recall": 48.4, "fpr": 27.1, "baseline": true, "latency": 196}, {"name": "RMS Energy VAD", "label": "RMS Energy VAD", "recall": 99.6, "fpr": 44.5, "baseline": true, "latency": 123}, {"name": "OpenAI Realtime (Server VAD)", "label": "OpenAI Server VAD", "recall": 99.0, "fpr": 45.8, "baseline": true, "latency": 184}];
    const data=allData.filter(d=>d.recall>=80&&d.fpr<=15);
    const color=d=>d.kind?'var(--viz-series-1)':'var(--muted-foreground)';
    const radius=d=>8*Math.sqrt(d.latency/1500);
    const description=d=>`${d.name}\nRecall ${d.recall.toFixed(1)}% · FPR ${d.fpr.toFixed(1)}%\nDetection latency p50 ${d.latency.toLocaleString()} ms`;
    access.textContent=data.map(description).join('; ');
    function show(e,d){
      tip.textContent=description(d);tip.hidden=false;
      const box=root.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
      tip.style.left=Math.max(8,Math.min(box.width-tw-8,e.clientX-box.left+13))+'px';
      tip.style.top=Math.max(8,Math.min(box.height-th-8,e.clientY-box.top+13))+'px';
      if(e.type==='click')access.textContent=description(d);
    }
    function attachInteraction(svg,items,x,y,bounds){
      svg.append('rect').attr('data-chart-hit','').attr('class','cursor-interaction').attr('x',bounds.l).attr('y',bounds.t).attr('width',bounds.r-bounds.l).attr('height',bounds.b-bounds.t).attr('fill','transparent').on('pointermove click',function(e){
        const [px,py]=d3.pointer(e,this),d=d3.least(items,d=>(x(d.fpr)-px)**2+(y(d.recall)-py)**2);
        if(d&&Math.hypot(x(d.fpr)-px,y(d.recall)-py)<30)show(e,d);else tip.hidden=true;
      }).on('pointerleave',()=>tip.hidden=true);
    }
    function axes(svg,x,y,bounds,opt={}){
      const {l,r,t,b}=bounds;
      svg.append('rect').attr('data-chart-frame','').attr('x',l).attr('y',t).attr('width',r-l).attr('height',b-t).attr('fill','none').attr('stroke','var(--border)');
      svg.append('g').attr('transform',`translate(0,${b})`).call(d3.axisBottom(x).tickValues(opt.xticks||x.ticks(4)).tickFormat(d=>(opt.precision?d.toFixed(opt.precision):d)+'%').tickSize(0).tickPadding(9)).call(g=>g.select('.domain').remove());
      svg.append('g').attr('transform',`translate(${l},0)`).call(d3.axisLeft(y).tickValues(opt.yticks||y.ticks(5)).tickFormat(d=>(opt.yprecision?d.toFixed(opt.yprecision):(opt.precision?d.toFixed(opt.precision):d))+'%').tickSize(0).tickPadding(8)).call(g=>g.select('.domain').remove());
      svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',(l+r)/2).attr('y',b+39).attr('text-anchor','middle').text(opt.short?'FPR (%) · Lower →':'False-positive rate (%) · Lower to the right →');
      svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('transform',`translate(${opt.inset?14:15},${(t+b)/2}) rotate(-90)`).attr('text-anchor','middle').text(opt.inset?'Recall (%)':'Recall (%) · Higher is better');
    }
    function paintPoints(svg,items,x,y){
      [...items].sort((a,b)=>Number(!!a.kind)-Number(!!b.kind)).forEach(d=>svg.append('circle').attr('data-model',d.name).attr('data-latency',d.latency).attr('cx',x(d.fpr)).attr('cy',y(d.recall)).attr('r',radius(d)).attr('fill',color(d)).attr('fill-opacity',d.kind?.86:.62));
    }
    function draw(){
      tip.hidden=true;
      const w=host.clientWidth,narrow=w<550,h=narrow?450:545,b={l:64,r:w-15,t:35,b:h-54};
      d3.select(host).selectAll('*').remove();
      const size=d3.select(root.querySelector('.rf-size'));size.selectAll('*').remove();
      const lw=Math.min(w,470),lh=28,legend=size.append('svg').attr('class','rf-chart').attr('width',lw).attr('height',lh).attr('viewBox',`0 0 ${lw} ${lh}`).attr('aria-label','Circle area represents detection latency p50. Smaller is faster.');
      legend.append('text').attr('x',0).attr('y',20).text('Latency p50 · Smaller is faster');
      const svg=d3.select(host).append('svg').attr('class','rf-chart rf-overview').attr('width',w).attr('height',h).attr('viewBox',`0 0 ${w} ${h}`).attr('role','img').attr('aria-label','Sixteen TurnBench interruption models with Recall at least 80 percent and FPR at most 15 percent. Recall increases upward, FPR decreases to the right. Circle area represents median detection latency. All points use their true benchmark coordinates.');
      const ex=d3.extent([...data.map(d=>d.fpr),15]),ey=d3.extent([80,100,...data.map(d=>d.recall)]),pad=(ex[1]-ex[0])*.045;
      const x=d3.scaleLinear().domain([ex[0]-pad,ex[1]+pad]).range([b.r-10,b.l+10]),y=d3.scaleLinear().domain(ey).range([b.b-10,b.t+10]);
      const xm=d3.median(allData,d=>d.fpr),ym=d3.median(allData,d=>d.recall);
      svg.append('rect').attr('x',x(xm)).attr('y',b.t).attr('width',b.r-x(xm)).attr('height',y(ym)-b.t).attr('fill','color-mix(in srgb,var(--green) 14%,var(--background))');
      svg.append('rect').attr('x',b.l).attr('y',y(ym)).attr('width',x(xm)-b.l).attr('height',b.b-y(ym)).attr('fill','var(--muted)').attr('opacity',.28);
      svg.append('text').attr('x',b.r).attr('y',17).attr('text-anchor','end').text('Higher Recall ↑ · Lower FPR →');
      axes(svg,x,y,b,{xticks:narrow?[5,10,15]:[5,7.5,10,12.5,15],yticks:[80,85,90,95,100],short:narrow});
      paintPoints(svg,data,x,y);
      const occupied=data.map(d=>{const r=radius(d)+3;return{x:x(d.fpr)-r,y:y(d.recall)-r,width:2*r,height:2*r};});
      const overlaps=(a,c)=>a.x<c.x+c.width+4&&a.x+a.width+4>c.x&&a.y<c.y+c.height+4&&a.y+a.height+4>c.y;
      const labels=[...data].sort((a,c)=>Number(!!c.kind)-Number(!!a.kind));
      labels.forEach(d=>{
        if(narrow&&!d.kind&&!['p99lab turn-1-mini','SPX-AI MicroCF','WavLM Base Causal','Neosapience Nunchi v1 (Single-Channel)'].includes(d.name))return;
        const name=d.kind?(narrow?'AI Rudder '+(d.kind==='swift'?'Swift':'Bearing'):'AI Rudder '+d.label):d.label;
        const t=svg.append('text').attr('class','rf-label').style('font-weight',d.kind?500:400).text(name),r=radius(d);
        const cands=d.kind?[[-r-8,4,'end'],[-r-8,-9,'end'],[-r-8,-18,'end'],[-r-8,27,'end'],[-r-8,40,'end'],[-r-8,-32,'end']]:[[r+6,4,'start'],[-r-6,4,'end'],[0,-r-7,'middle'],[0,r+18,'middle'],[r+7,-12,'start'],[-r-7,-12,'end'],[r+7,22,'start'],[-r-7,22,'end'],[0,-r-24,'middle'],[0,r+35,'middle'],[-r-7,-28,'end'],[r+7,-28,'start'],[-r-7,38,'end'],[r+7,38,'start']];
        let placed=false,chosen;
        for(const [dx,dy,anchor] of cands){t.attr('x',x(d.fpr)+dx).attr('y',y(d.recall)+dy).attr('text-anchor',anchor);const bb=t.node().getBBox();
          if(bb.x>=b.l+4&&bb.x+bb.width<=b.r-4&&bb.y>=b.t+4&&bb.y+bb.height<=b.b-4&&!occupied.some(o=>overlaps(bb,o))){occupied.push({x:bb.x,y:bb.y,width:bb.width,height:bb.height});placed=true;chosen={bb,dy};break;}}
        if(!placed){t.remove();return;}
        if(!d.kind&&Math.abs(chosen.dy)>25){const bb=chosen.bb;svg.insert('line',()=>t.node()).attr('x1',x(d.fpr)).attr('y1',y(d.recall)+(chosen.dy>0?r+3:-r-3)).attr('x2',Math.max(bb.x,Math.min(bb.x+bb.width,x(d.fpr)))).attr('y2',chosen.dy>0?bb.y-4:bb.y+bb.height+4).attr('stroke','var(--border)');}
      });
      attachInteraction(svg,data,x,y,b);

    }
    new ResizeObserver(draw).observe(host);draw();
  })();
