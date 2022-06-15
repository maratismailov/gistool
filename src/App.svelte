<script>
	import { onMount } from "svelte";
	import { getContext } from "svelte";

	// const url = getContext('url')
	const url = location.href.includes("localhost")
		? "http://localhost:8000"
		: "https://gnss.ml/api";
	let fullOutput;
	let map;
	let center = [42.8746, 74.5698];
	let zoom = 12;
	let objects_layer;
	let oldObjectsLayer;
	let activeObject;
	const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const osmAttr =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	const otmUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
	const otmAttr =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	const stWaterUrl =
		"https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}";
	const stWaterAttr =
		'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	const esriImUrl =
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
	const esriImAttr =
		"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
	const darkMatterUrl =
		"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
	const darkMatterAttr =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

	let objectsToSave = [];

	onMount(() => {
		const osm = L.tileLayer(osmUrl, {
			attribution: osmAttr,
		});
		const openTopoMap = L.tileLayer(otmUrl, {
			attribution: otmAttr,
		});
		const Stamen_Watercolor = L.tileLayer(stWaterUrl, {
			attribution: stWaterAttr,
			subdomains: "abcd",
			minZoom: 1,
			maxZoom: 16,
			ext: "jpg",
		});
		const esriImagery = L.tileLayer(esriImUrl, {
			attribution: esriImAttr,
		});
		const darkMatter = L.tileLayer(darkMatterUrl, {
			attribution: darkMatterAttr,
			subdomains: "abcd",
		});
		const baseLayers = {
			OpenStreetMap: osm,
			"Stamen Water Color": Stamen_Watercolor,
			OpenTopoMap: openTopoMap,
			"ESRI Imagery": esriImagery,
			"CartoDB Dark Matter": darkMatter,
		};

		const overlayMaps = {};
		const createMap = () => {
			map = L.map("map", {
				center: center,
				zoom: zoom,
				layers: [osm],
				drawControl: true,
			}).setView(center, zoom);
			layers: [Stamen_Watercolor];
			L.control.layers(baseLayers, overlayMaps).addTo(map);
			objects_layer = L.geoJSON(null, {
				onEachFeature: onEachFeature,
				pmIgnore: true,
			}).addTo(map);
			oldObjectsLayer = L.geoJSON(null, {
				onEachFeature: onEachFeature,
				pmIgnore: true,
			}).addTo(map);
			map.pm.addControls({
				position: "topleft",
			});
			map.on("pm:create", (e) => {
				const newObject = e.layer.toGeoJSON();
				newObject.geometry.crs = {
					type: "name",
					properties: { name: "EPSG:4326" },
				};
				objects_layer.addData(newObject);
				objectsToSave.push(newObject);
				console.log(objectsToSave);
			});
		};
		createMap();
	});
	const onEachFeature = (feature, layer) => {
		layer.on({
			click: () => layer_click(feature, layer),
		});
	};
	const layer_click = (feature, layer) => {
		console.log("ddd", feature);
		activeObject = feature;
	};
	const saveObject = async (object) => {
		if (object.type !== "Feature") {
			object.crs = { type: "name", properties: { name: "EPSG:4326" } };
		}
		console.log(object);

		console.log(JSON.stringify(object));
		const string = JSON.stringify(object);
		const post = await fetch(url + "/save_object?data=" + string).then(
			(response) => response.json()
		);
	};
	const getGnssPoints = async () => {
		activeObject = null;
		oldObjectsLayer.clearLayers();
		const allObjects = await fetch(url + "/get_gnss_points").then(
			(response) => response.json()
		);
		allObjects.forEach((elem) => {
			let toAdd = JSON.parse(elem.geom);
			toAdd.properties = { name: elem.name };
			oldObjectsLayer.addData(toAdd);
		});
	};
	const submitForm = async () => {
		event.preventDefault();
		console.log(fullOutput)
		const dataArray = new FormData();
		dataArray.append("file", fullOutput[0]);
		console.log(dataArray)
		for(var pair of dataArray.entries()) {
			console.log(pair[0]+', '+pair[1]);
			}
		// fetch(url + '/upload_full_output', {
		//   method: "GET",
		//   headers: [["Content-Type", "multipart/form-data"]],
		//   body: dataArray
		// })
		//   .then(response => {
		//     // Successfully uploaded
		//   })
		//   .catch(error => {
		//     // Upload failed
		//   });
		const upload = await fetch(url + "/upload_full_output", {
			method: "POST",
			body: dataArray,
		}).then((response) => {
			console.log(response.json())
		});
	};
	const getAllObjects = async () => {
		activeObject = null;
		oldObjectsLayer.clearLayers();
		const allObjects = await fetch(url + '/get_gnss_points').then((response) =>
			response.json()
		);
		allObjects.forEach((elem) => {
			let toAdd = JSON.parse(elem.geom);
			toAdd.properties = { name: elem.name };
			oldObjectsLayer.addData(toAdd);
		});
	};
</script>

<div style="height: 69vh" class="map" id="map">
	<slot />
</div>

<div style="margin-bottom: 225px;">
	<div class="controls-row">
		{#if activeObject}
			<div class="group">
				<input
					class="name-input"
					bind:value={activeObject.properties.name}
					type="text"
					required
				/><span class="highlight" /><span class="bar" /><label
					class="input-placeholder">Object name</label
				>
			</div>
			{#if activeObject.properties.name}
				<button
					class="pure-material-button-contained"
					on:click={() => saveObject(activeObject)}
				>
					Save object
				</button>
			{/if}
		{/if}
	</div>
	<div class="controls-row">
		<button class="pure-material-button-contained" on:click={getGnssPoints}>
			Get GNSS points
		</button>
		<div>
			<form on:submit={submitForm}>
				<input type="file" bind:files={fullOutput} />
				<br />
				<input type="submit" />
			</form>
		</div>
		<div class="controls-row">
			<button class="pure-material-button-contained" on:click={getAllObjects}>
				Get all objects
			</button>
		</div>
	</div>
</div>

<style>
</style>
