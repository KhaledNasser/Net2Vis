import * as common from './Common';

// Find all occurences of a group in the network
export function findGroupOccurences(group, network) {
  var input = findInputNode(group); // Find one input Node to the Graph
  var inputOccurences = findInputOccurences(input.inputNode, network); // Check, where the inputNode type exists in the network
  var matchesList = generateInitialMatchesList(group, network, inputOccurences, input.inputID); // Initialize the Matches List using the input node and its occurences
  var nextLayerInfo = findUncheckedConnectedLayer(matchesList); // Get the info for which layer to check for a match next
  while (nextLayerInfo.source !== -1) { // Do as long as there are more layers to check
    for (var i in matchesList) { // Iterate over all lists in the matches List
      var currentSourceLayer = network.layers[common.getLayerByID(matchesList[i][nextLayerInfo.source].matchID, network.layers)]; // Get the source layer from which we get to the layer to be inspected from the network
      var layerID = nextLayerInfo.type === 'out' ? currentSourceLayer.properties.output[nextLayerInfo.connection] : currentSourceLayer.properties.input[nextLayerInfo.connection]; // Get the ID of the current layer to be inspected(depending on in or out connected)
      var layerNumber = common.getLayerByID(layerID, network.layers); // Map the layerID to the position in the array
      var outputsLayer = network.layers[layerNumber].properties.output; // Get the outputs for this Layer
      var inputsLayer = network.layers[layerNumber].properties.input; // Get the inputs for this Layer
      var groupNumber = nextLayerInfo.type === 'out' ? group.layers[nextLayerInfo.source].output[nextLayerInfo.connection] : group.layers[nextLayerInfo.source].input[nextLayerInfo.connection]; // Get the number of the group node to be inspected (depending on in or out connected)
      var outputsGroup = group.layers[groupNumber].output; // Get the outputs for the input Layer of the Group
      var inputsGroup = group.layers[groupNumber].input; // Get the outputs for the input Layer of the Group
      if (checkOutputsMatching(outputsGroup, outputsLayer, network, group) && checkInputsMatching(inputsGroup, inputsLayer, network, group)) { // Outputs and Inputs match
        if (checkOutputMatchIds(outputsLayer, outputsGroup, matchesList[i]) && checkInputMatchIds(inputsLayer, inputsGroup, matchesList[i])) {
          matchesList[i][groupNumber].matchID = network.layers[layerNumber].id; // Assign the match ID
        } else { // Output or Input IDs do not match
          matchesList.splice(i, 1); // Remove the list from the matchesList
          i = i - 1; // Do not skip an element after removal
        }
      } else { // Output or Inputs do not match
        matchesList.splice(i, 1); // Remove the list from the matchesList
        i = i - 1; // Do not skip an element after removal
      }
    }
    nextLayerInfo = findUncheckedConnectedLayer(matchesList); // Get the info for which layer to check for a match next
  }
  return matchesList;
}

// Find an input Node of a Group
function findInputNode(group) {
  for (var j in group.layers) { // Iterate over all layers in the Group
    if(group.layers[j].input.length === 0) { // Layer has no inputs contained in the Group
      return {inputID: j, inputNode: group.layers[j]};
    }
  }
}

// Find all layers that are the same as the input layer of the group
function findInputOccurences(inputNode, network) {
  var occurences = []; // Initialize the occurences
  for (var i in network.layers) { // Iterate over all layers in the network
    if (network.layers[i].name === inputNode.name) { // The Layers have the same name
      occurences.push(i); // Add the position of the Layer in the Network to the occurences
    }
  }
  return occurences;
}

// Initialize the matches list, where, for each match of the input layer, a match list is created in the matches list
function generateInitialMatchesList(group, network, inputOccurences, inputID) {
  var matchesList = []; // Initialize the matchesList
  for (var i in inputOccurences) { // Iterate over all occurences of the group input Layer in the Network
    var outputsLayer = network.layers[inputOccurences[i]].properties.output; // Get the outputs for this Layer
    var outputsGroup = group.layers[inputID].output; // Get the outputs for the input Layer of the Group
    if (checkOutputsMatching(outputsGroup, outputsLayer, network, group)) { // If parts still equal
      matchesList.push(JSON.parse(JSON.stringify(group.layers.slice(0)))); // Copy the group layers to the matches List
      matchesList[matchesList.length - 1][inputID].matchID = network.layers[inputOccurences[i]].id; // Set the match for the input layer of the group in this match of the matches List
    }
  }
  return matchesList;
}

function findUncheckedConnectedLayer(matchesList) {
  if (matchesList.length > 0) { // If there are lists to be checked still
    var list = matchesList[0]; // Get the first list as an example (since all should contain matches at the same positions)
    for (var i in list) { // Iterate over the list items (nodes of the group) 
      if (typeof(list[i].matchID) !== 'undefined') { // If current group node already matches
        for (var j in list[i].output) { // Iterate over the outputs
          if (typeof(list[list[i].output[j]].matchID) === 'undefined') { // If group node connected at this output not matched
            return {type: 'out', source: i, connection: j}; // Layer to be inspected has been found
          }
        }
        for (var k in list[i].input) { // Iterate over all Inputs
          if (typeof(list[list[i].input[k]].matchID) === 'undefined') { // If group node connected at this input not matched
            return {type: 'in', source: i, connection: k}; // Layer to be inspected has been found
          }
        }
      }
    }
  }
  return {type: 'in', source: -1, connection: -1}; // No layer to be inspected, return this as a signal
}

// Check if the outputs of Networklayer and Groupnode are matching
function checkOutputsMatching(outputsGroup, outputsLayer, network, group) {
  if (outputsGroup.length === 0) { // No outputs of the current layer in the group selected
    return true;
  } else if (outputsGroup.length === outputsLayer.length) { // First, check if both Network Layer and Group Layer have the same Number of outputs
    for (var j in outputsGroup) { // Iterate over all ouptuts of the Group Layer 
      if (group.layers[outputsGroup[j]].name !== network.layers[common.getLayerByID(outputsLayer[j], network.layers)].name) { // Not the same Layer Name as the Network output
        return false; // Network part not equal
      }
    }
  } else {
    return false; // Network part not equal
  }
  return true;
}

// Check if the IDs of the output match the matchesList entry
function checkOutputMatchIds(outputsLayer, outputsGroup, matchesList) {
  for (var i in outputsGroup) { // For all outputs of the layer
    if (typeof(matchesList[outputsGroup[i]].matchID) === 'undefined') { // Check if the match was already assigned
      if (outputsLayer[i] !== matchesList[outputsGroup[i]].matchID) { // If the layer output does not match the match
        return false; // The IDs do not match
      }
    }
  }
  return true; // All IDs match
}

// Check if the inputs of Networklayer and Groupnode are matching
function checkInputsMatching(inputsGroup, inputsLayer, network, group) {
  var same = true; // Initialize the sameness placeholder
  if (inputsGroup.length === 0) {
    return same;
  } else if (inputsGroup.length === inputsLayer.length) { // First, check if both Network Layer and Group Layer have the same Number of inputs
    for (var j in inputsGroup) { // Iterate over all inputs of the Group Layer 
      if (group.layers[inputsGroup[j]].name !== network.layers[common.getLayerByID(inputsLayer[j], network.layers)].name) { // Not the same Layer Name as the Network input
        same = false; // Network part not equal
      }
    }
  } else {
    same = false; // Network part not equal
  }
  return same;
}

// Check if the IDs of the input match the matchesList entry
function checkInputMatchIds(inputsLayer, inputsGroup, matchesList) {
  for (var i in inputsGroup) { // For all outputs of the layer
    if (typeof(matchesList[inputsGroup[i]].matchID) === 'undefined') { // Check if the match was already assigned
      if (inputsLayer[i] !== matchesList[inputsGroup[i]].matchID) { // If the layer input does not match the match
        return false; // The IDs do not match
      }
    }
  }
  return true; // All IDs match
}