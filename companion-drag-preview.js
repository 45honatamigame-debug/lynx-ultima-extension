const params=new URLSearchParams(location.search);
document.body.dataset.key=params.get("key")||"";
document.getElementById("label").textContent=params.get("label")||"DROP HERE";
const x=Number(params.get("x"))||0,y=Number(params.get("y"))||0;
document.getElementById("coords").textContent=`X ${Math.round(x)} · Y ${Math.round(y)}`;
