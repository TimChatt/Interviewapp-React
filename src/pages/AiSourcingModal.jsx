import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Input,
  Select,
  Checkbox,
  Text,
} from "@chakra-ui/react";

const AiSourcingModal = ({ isOpen, onClose, filters, setFilters }) => {
  // Handle filter updates
  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Search Filters</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Location */}
            <Text fontWeight="bold">Location(s)</Text>
            <Input
              placeholder="Enter locations (comma-separated)"
              value={filters.locations || ""}
              onChange={(e) => updateFilter("locations", e.target.value)}
            />

            {/* Experience */}
            <HStack>
              <VStack align="start">
                <Text fontWeight="bold">Min Experience (Years)</Text>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minExperience || ""}
                  onChange={(e) => updateFilter("minExperience", e.target.value)}
                />
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Max Experience (Years)</Text>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxExperience || ""}
                  onChange={(e) => updateFilter("maxExperience", e.target.value)}
                />
              </VStack>
            </HStack>

            {/* Job Title */}
            <Text fontWeight="bold">Job Title</Text>
            <Input
              placeholder="Enter job title"
              value={filters.jobTitle || ""}
              onChange={(e) => updateFilter("jobTitle", e.target.value)}
            />

            {/* Skills/Keywords */}
            <Text fontWeight="bold">Skills/Keywords</Text>
            <Input
              placeholder="Enter skills (comma-separated)"
              value={filters.skills || ""}
              onChange={(e) => updateFilter("skills", e.target.value)}
            />

            {/* Company Filters */}
            <Text fontWeight="bold">Companies</Text>
            <Input
              placeholder="Enter company names (comma-separated)"
              value={filters.companies || ""}
              onChange={(e) => updateFilter("companies", e.target.value)}
            />

            <Text fontWeight="bold">Exclude Companies</Text>
            <Input
              placeholder="Enter companies to exclude"
              value={filters.excludeCompanies || ""}
              onChange={(e) => updateFilter("excludeCompanies", e.target.value)}
            />

            {/* Degree & University Filters */}
            <Text fontWeight="bold">Degree Requirements</Text>
            <Select
              placeholder="Select degree level"
              value={filters.degree || ""}
              onChange={(e) => updateFilter("degree", e.target.value)}
            >
              <option value="bachelor">Bachelor's</option>
              <option value="master">Master's</option>
              <option value="phd">PhD</option>
              <option value="none">No Degree Required</option>
            </Select>

            <Text fontWeight="bold">University</Text>
            <Input
              placeholder="Enter university names (comma-separated)"
              value={filters.universities || ""}
              onChange={(e) => updateFilter("universities", e.target.value)}
            />

            {/* Power Filters */}
            <Text fontWeight="bold">Power Filters</Text>
            <HStack spacing={4}>
              <Checkbox
                isChecked={filters.diversityHiring || false}
                onChange={(e) => updateFilter("diversityHiring", e.target.checked)}
              >
                Diversity Focus
              </Checkbox>
              <Checkbox
                isChecked={filters.highAchievers || false}
                onChange={(e) => updateFilter("highAchievers", e.target.checked)}
              >
                High Achievers
              </Checkbox>
            </HStack>
          </VStack>

          <Button mt={4} colorScheme="blue" onClick={onClose} width="full">
            Apply Filters
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AiSourcingModal;
