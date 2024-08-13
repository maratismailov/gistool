<script>
	import { onMount } from "svelte";
	import { getContext } from "svelte";
	import { each } from "svelte/internal";

	// const url = getContext('url')
	const url = location.href.includes("localhost")
		? "http://localhost:8000"
		: "https://gistool.line.pm/api";
	let fullOutput;
	let projectName = '';
	let allObjects;
	let parsedObjects = [];
	let map;
	let center = [42.8746, 74.5698];
	let zoom = 12;
	let objects_layer;
	let oldObjectsLayer;
	let activeObject;
	let dbStatus = false
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
		const string = JSON.stringify(object);
		const post = await fetch(url + "/save_object?data=" + string).then(
			(response) => response.json()
		);
	};
	const getGnssPoints = async () => {
		activeObject = null;
		oldObjectsLayer.clearLayers();
		allObjects = await fetch(url + "/get_gnss_points").then(
			(response) => response.json()
		);
		
		allObjects.forEach((elem) => {
			parsedObjects = [...parsedObjects, JSON.parse('[' + elem + ']')]
			// parsedObjects.push(JSON.parse('[' + elem + ']'))
			console.log(JSON.parse('[' + elem + ']'))
			// let toAdd = JSON.parse(elem.geom);
			// console.log(toAdd)
			// toAdd.properties = { name: elem.name };
			// oldObjectsLayer.addData(toAdd);
		});
		console.log(parsedObjects)
	};
	const submitForm = async () => {
		event.preventDefault();
		const dataArray = new FormData();
		dataArray.append("file", fullOutput[0]);
		dataArray.append('project_name', projectName)
		const upload = await fetch(url + "/upload_full_output", {
			method: "POST",
			body: dataArray,
		})
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
	const resetDatabase = () => {
		fetch(url + '/recreate_db')
	}
	const checkForDatabase = async () => {
		dbStatus = await fetch(url + '/check_for_database').then((response) => response.json())
	}
	const showOnMap = points => {
		console.log(points)
		points.forEach(elem =>{
			console.log(JSON.parse(elem.geojson))
			let toAdd = JSON.parse(elem.geojson);
			// console.log(toAdd)
			toAdd.properties = { name: elem.name };
			oldObjectsLayer.addData(toAdd);
		})
	}
</script>

<div style="height: 69vh" class="map" id="map">
	<slot />
</div>

<div class="controls-row">
 {#if dbStatus}
	<p>
		database not ready
	</p>
 {/if}
 {#if dbStatus == false}
 <p>
	 database is ready
 </p>
{/if}
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
				<input type="text" bind:value={projectName} />
				<br />
				{#if projectName}
					<input type="submit" />
				{/if}
			</form>
		</div>
		<div class="controls-row">
			<button class="pure-material-button-contained" on:click={getAllObjects}>
				Get all objects
			</button>
		</div>
		<div class="controls-row">
			<button class="pure-material-button-contained" on:click={resetDatabase}>
				reset database
			</button>
		</div>
		<div class="controls-row">
			<button class="pure-material-button-contained" on:click={checkForDatabase}>
				check for db
			</button>
		</div>
		{#if parsedObjects}
			<div>
				{#each parsedObjects as project}
					<div style="margin-top: 26px;">
						{project[0].project_name}
						<div class="controls-row">
							<button class="pure-material-button-contained" on:click={() => showOnMap(project)}>
								show on map
							</button>
						</div>
					</div>
					<div style="margin-left: 8px;">
						{#each project as point}
							<div>
								{point.name}
							</div>1
							<div>
								details:
								<div style="margin-left: 8px;">
									{point.details}
								</div>
							</div>
							<div>
								geoJSON:
								<div style="margin-left: 8px;">
									{point.geojson}
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
</style>
