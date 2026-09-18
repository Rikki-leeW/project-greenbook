import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './css/base/index.css';
import './css/App.css';
import './css/sprig-print.css';
import GrowingRecipeDetail from './pages/GrowingRecipeDetail';
import GrowingPlaceDetail from './pages/GrowingPlaceDetail';
import GardenTrials from './pages/GardenTrials';
import PlantComparison from './pages/PlantComparison';
import { sampleGardenData } from './data/sampleData';
import type { GardenData, GrowingSetup } from './types';
import testPhoto from './images/backgrounds/base-paper-texture.jpg';
const noop = () => {};
const notes = Array.from({length:12},(_,i)=>`Observation ${i+1}: This temporary example checks a longer reading page, its wrapping and links. Compost was evenly mixed and watering remained consistent. This is test content only.`).join('\n\n');
const recipe: GrowingSetup = {id:'qa-recipe',name:'Temporary compost recipe — long record',category:'own-mix',isFavourite:true,rating:4,createdAt:'2026-06-01',notes,ingredientIds:['qa-ingredient'],recipeComponents:[{sourceType:'ingredient',sourceId:'qa-ingredient',quantity:2,unit:'part'},{sourceType:'product',sourceId:'qa-product',quantity:1,unit:'part'}],photoUrls:[testPhoto],photoMetadata:[{photoId:'qa-photo',photoUrl:testPhoto,photoDate:'2026-06-01',title:'Temporary image for photo layout',notes:'Test texture image; no gardener records used.'}]};
const data: GardenData = {...sampleGardenData,
 growingSetups:[recipe],
 ingredients:[{id:'qa-ingredient',name:'Temporary compost',createdAt:'2026-06-01'}],
 products:[{id:'qa-product',name:'Temporary bought mix',brand:'Test brand',createdAt:'2026-06-01'}],
 growingPlaces:[{id:'qa-place',name:'Temporary raised bed — populated detail',kind:'raised-bed',notes,createdAt:'2026-06-01',growingSetupId:recipe.id,photoUrls:[testPhoto]}],
 plantStories:sampleGardenData.plantStories.map(p=>({...p,currentGrowingPlaceId:'qa-place',currentGrowingSetupId:recipe.id,photoUrls:[testPhoto],photoDates:['2026-06-20'],photoMetadata:[{photoId:`qa-${p.id}`,photoUrl:testPhoto,photoDate:'2026-06-20',title:'Temporary image for photo layout'}]})),
 gardenTrials:[{id:'qa-trial',title:'Temporary watering trial — long evidence report',startDate:'2026-06-01',status:'completed',completedDate:'2026-09-01',question:'Does the compost mix retain moisture evenly?',purpose:notes,expectation:'Even moisture with consistent watering.',whatIsChanging:'Compost ratio',whatShouldStayComparable:'Container, planting date and water volume',watchingFor:'Moisture and leaf condition',result:'clear',conclusion:notes,nextTime:'Repeat with another mix.',createdAt:'2026-06-01',photoUrls:[testPhoto],photoDates:['2026-06-01'],photoMetadata:recipe.photoMetadata,observations:Array.from({length:6},(_,i)=>({id:`qa-observation-${i}`,date:`2026-06-${String(i+2).padStart(2,'0')}`,body:notes,createdAt:'2026-06-01',photoUrls:[testPhoto],photoDates:['2026-06-20']}))}]
};
function Check(){
 const [view,setView]=useState('Recipe');const [archived,setArchived]=useState(false);const [garden,setGarden]=useState(data);const [trialId,setTrialId]=useState<string|null>('qa-trial');
 const common={onNavigate:noop,onBack:noop,onEdit:noop,onDelete:noop};
 return <><nav aria-label="Temporary check views" style={{position:'relative',zIndex:1,padding:'70px 16px 8px'}}>{['Recipe','Place','Trial','Comparison'].map(v=><button key={v} onClick={()=>setView(v)}>{v}</button>)}<button onClick={()=>setArchived(!archived)}>{archived?'Show active recipe':'Show archived recipe'}</button></nav>
 {view==='Recipe'&&<GrowingRecipeDetail {...common} recipe={{...recipe,isArchived:archived,archivedAt:archived?'2026-09-01':undefined}} ingredients={garden.ingredients} products={garden.products} growingSetups={garden.growingSetups} plants={garden.plantStories} growingPlaces={garden.growingPlaces} purchases={[]} backLabel="Temporary source" onBackToOrigin={noop} onDuplicate={noop} onToggleFavourite={noop} onSetRating={noop} onArchive={noop} onRestore={noop} onOpenGrowingPlace={noop} onOpenPlant={noop} onOpenIngredient={noop} onOpenProduct={noop} onOpenRecipe={noop}/>}
 {view==='Place'&&<GrowingPlaceDetail {...common} growingPlace={garden.growingPlaces[0]} plants={garden.plantStories} events={garden.events} growingSetups={garden.growingSetups} journeyBackLabel="Temporary source" onOpenGrowingPlaces={noop} onOpenPlant={noop} onOpenEvent={noop} onOpenRecipe={noop}/>}
 {view==='Trial'&&<GardenTrials gardenData={garden} initialTrialId={trialId} onTrialSelectionChange={setTrialId} onGardenDataChange={setGarden} onNavigate={noop} onOpenRelationship={noop} journeyBackLabel="Temporary source" onJourneyBack={noop}/>}
 {view==='Comparison'&&<PlantComparison gardenData={garden} plantIds={garden.plantStories.slice(0,2).map(p=>p.id)} activeSavedComparisonId={null} plants={garden.plantStories} growingPlaces={garden.growingPlaces} growingSetups={garden.growingSetups} ingredients={garden.ingredients} products={garden.products} events={garden.events} harvests={garden.harvests} backLabel="Back to temporary source" onBack={noop} onEditComparison={noop} onSaveComparison={noop} onNavigate={noop} onOpenRelationship={noop}/>}
 </>;
}
createRoot(document.getElementById('root')!).render(<Check/>);
