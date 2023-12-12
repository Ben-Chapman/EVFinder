/**
 * Copyright 2023 Ben Chapman
 *
 * This file is part of The EV Finder.
 *
 * The EV Finder is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * The EV Finder is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with The EV Finder.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const bmwInventoryMapping = {
  interiorGenericColor: "interiorColor",
  name: "trimDesc",
  totalMsrp: "price",
  dealerEstArrivalDate: "deliveryDate",
};

const bmwVinMapping = {
  id: "Vehicle ID",
  totalMsrp: "Total MSRP",
  name: "Model",
  powertrain: "Powertrain",
  marketingText: "Marketing Text",
  technicalText: "Technical Text",
  acceleration: "Acceleration",
  horsepower: "Horsepower",
  milesPerGallonEqv: "MPGe",
  modelYear: "Model Year",
  productionNumber: "Production Number",
  destinationAndHandling: "Destination and Handling",
  vin: "VIN",
};

// These color code -> description mappings are not present in the initial inventory
// search API, so hardcoding them here. Use ../helpers/bmwColorMapping.js to generate.
const bmwColorMapping = {
  P0974: "without paintwork",
  FSACX: "Oyster Perforated SensaTec",
  P0973: "P0973",
  FSCHA: "Amido Perforated Leather",
  FSBJG: "Stonegrey Microfiber/Wool Blend cloth",
  P0C1M: "Phytonic Blue Metallic",
  FZ9XX: "Without Upholstery",
  P0000: "This Code Is Not Used",
  FSCIC: "Castanea Chestnut Perforated Leather",
  P0C57: "Aventurin Red Metallic",
  P0A96: "Mineral White Metallic",
  FSAMY: "Mocha Perforated SensaTec",
  FXXXX: "Without Color Indication",
  P0A90: "Dark Graphite Metallic",
  P0C4A: "Oxide Grey metallic",
  P0475: "Black Sapphire Metallic",
  P0C3N: "Storm Bay Metallic",
  P0300: "Alpine White",
  FSASW: "Black Perforated SensaTec",
  P0C35: "Blue Ridge Mountain Metallic",
  FVBHZ: "Fiona Red/Black Full Merino Leather",
  FZASW: "FZASW",
  P0490: "Special Order Color",
  FMAH7: "Black Vernasca Leather",
  P0C4W: "Skyscraper Grey metallic",
  FZBFV: "Fjord Blue/Black Full Merino Leather",
  FKHSW: "Black Perforated SensaTec",
  P0C4P: "Brooklyn Grey metallic",
  FVAHZ: "Fiona Red/Black Extended Merino Leather",
  FKHKC: "Cognac Perforated SensaTec",
  P0C4E: "San Remo Green Metallic",
  FMAOI: "Oyster Vernasca Leather with contrast stitching",
  P0C3Z: "Tanzanite Blue II Metallic",
  FMAG6: "Tacora Red Vernasca Leather with contrast stitching",
  FMANL: "Black Vernasca Leather with Blue contrast stitching",
  FVBTQ: "Tartufo Full Merino Leather",
  P0C36: "Dravit Grey Metallic",
  FZAFV: "Fjord Blue/Black Extended Merino Leather",
  FMAMU: "Mocha Vernasca Leather with contrast stitching",
  P0C31: "Portimao Blue Metallic",
  P0C1X: "Sunset Orange Metallic",
  FZ1XX: "Special Order Upholstery",
  FVBEW: "FVBEW",
  FVATQ: "Tartufo Extended Merino Leather",
  FKHFY: "Canberra Beige Perforated SensaTec",
  FKHG7: "Tacora Red Perforated SensaTec",
  P0X1E: "Frozen Portimao Blue metallic",
  P0X1F: "Frozen Pure Grey II Metallic",
  FZBSW: "Black Full Merino Leather",
  FVAEW: "Ivory White Extended Merino leather",
  P0668: "Jet Black",
  FKSJX: "Espresso Brown perforated and quilted Veganza",
  P0416: "Carbon Black Metallic",
  FKSJU: "Burgundy Red perforated and quilted Veganza",
  P0C5Y: "Cape York Green Metallic",
  P0C68: "Vegas Red Metallic",
  P0C64: "Frozen Deep Grey Metallic",
  FKTSW: "Black M Veganza/Alcantara",
  P0C5A: "Frozen Pure Grey Metallic",
  FKUSW: "Black Perforated Veganza",
  FZCJO: "M Full Merino Leather Dark Violet/Atlas Grey",
  FZCJP: "M Full Merino Leather Taupe/Atlas Grey",
  FKSFU: "Smoke White perforated and quilted Veganza",
  FKSSW: "Black Veganza",
  FVCJM: "Copper Brown/Atlas Grey Extended Merino Leather",
  FVCJN: "Silverstone II Atlas Grey Extended Merino Leather",
  FVCJL: "Black/Atlas Grey M Extended Merino Leather",
  FZDIE: "Caramel/Atlas Grey Full Merino Leather",
  FZDIF: "Taupe Grey/Night Blue Full Merino Leather",
  FVCSW: "Black Extended Merino Leather",
  P0C67: "Space Silver Metallic",
  FVDMY: "Mocha Full Merino Leather",
  FVDF2: "Amarone Full Merino Leather",
  FZETM: "Black Full Merino Leather and Dark Grey Cashmere",
  FVCTQ: "Tartufo Extended Merino Leather",
  P0C55: "Sparkling Copper Metallic",
  FVDFU: "Smoke White Full Merino Leather",
  FVEII: "Smoke White Full Merino Leather with Light Grey Cashmere Inlays",
  FVCMY: "Mocha Extended Merino Leather",
  FVCF2: "Amarone Extended Merino Leather",
  FKVMY: "Mocha Veganza",
  FVCFU: "Smoke White Extended Merino Leather",
  FKVSW: "Black Veganza",
  FKVJY: "Black/Black Burgundy Veganza",
  P0X1G: "Frozen Tanzanite Blue Metallic",
  FKVRI: "Cognac Veganza",
  FVDSW: "Black Full Merino Leather",
  FVDTQ: "Tartufo Full Merino Leather",
};

export { bmwColorMapping, bmwInventoryMapping, bmwVinMapping };
