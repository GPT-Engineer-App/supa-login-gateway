import userOrganizations from '../data/userOrganizations.json';

export const getUserOrganizations = () => {
  return userOrganizations;
};

export const addUserOrganization = (newOrg) => {
  if (!userOrganizations.includes(newOrg)) {
    userOrganizations.push(newOrg);
    // In a real application, you would save this to the server here
  }
};

export const deleteUserOrganization = (org) => {
  const index = userOrganizations.indexOf(org);
  if (index > -1) {
    userOrganizations.splice(index, 1);
    // In a real application, you would save this to the server here
  }
};
