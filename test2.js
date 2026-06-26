const query = `
[out:json][timeout:60];
area["name"="Wonogiri"]->.searchArea;
(
node(area.searchArea)["amenity"~"cafe",i];
);
out center 5;
`;

fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'GaetinScraperTest/1.0'
  },
  body: new URLSearchParams({ data: query })
})
.then(r => r.text())
.then(data => console.log(data))
.catch(console.error);
