import { expectedIndexes } from '../lib/collectionUtils';
import { Collections } from 'meteor/vulcan:lib';

function isUnbackedCollection(collection)
{
  if (collection.collectionName === 'Settings' || collection.collectionName === 'Callbacks') {
    // Vulcan collections with no backing database table
    return true;
  }
  
  return false;
}

function indexesMatch(indexA, indexB)
{
  return (_.isEqual(indexA.key, indexB.key)
      && _.isEqual(_.keys(indexA.key), _.keys(indexB.key))
      && _.isEqual(indexA.partialFilterExpression, indexB.partialFilterExpression));
}

function isUnrecognizedIndex(collection, index)
{
  let expectedIndexesForCollection = expectedIndexes[collection.collectionName]
  
  if (index.name === '_id_')
    return false;
  
  for(let i=0; i<expectedIndexesForCollection.length; i++)
  {
    if (indexesMatch(expectedIndexesForCollection[i], index))
      return false;
  }
  return true;
}

// Return a list of indexes that don't correspond to an ensureIndex call
export async function getUnrecognizedIndexes()
{
  let unrecognizedIndexes = [];
  for(let i=0; i<Collections.length; i++)
  {
    try {
      let collection = Collections[i];
      
      if (isUnbackedCollection(collection))
        continue;
      
      let indexes = await collection.rawCollection().indexes();
      
      indexes.forEach(index => {
        if (isUnrecognizedIndex(collection, index)) {
          unrecognizedIndexes.push({
            collectionName: collection.collectionName,
            index: index,
          });
        }
      })
    } catch(e) {
      //eslint-disable-next-line no-console
      console.error(e)
    }
  }
  return unrecognizedIndexes;
}

function isMissingIndex(collection, index, actualIndexes)
{
  for (let actualIndex of actualIndexes)
  {
    if (indexesMatch(index, actualIndex))
      return false;
  }
  
  return true;
}

// Return a list of indexes for which an ensureIndex call was made, but the
// index isn't in the database. (This can happen if the collection has more
// than the 64 maximum indexes, or its specification is malformed in some way
// that prevents it from being created.)
export async function getMissingIndexes()
{
  let missingIndexes = [];
  
  for (let collectionName in expectedIndexes)
  {
    let collection = _.find(Collections, c => c.collectionName === collectionName);
    
    if (!collection || isUnbackedCollection(collection))
      continue;
    
    let indexes = await collection.rawCollection().indexes();
    
    for (let expectedIndex of expectedIndexes[collectionName]) {
      if (isMissingIndex(collection, expectedIndex, indexes)) {
        missingIndexes.push({
          collectionName: collectionName,
          index: expectedIndex
        });
      }
    }
  }
  
  return missingIndexes;
}