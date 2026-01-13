const User = require('../models/User');

// 1. Get User Profile (Updated to include addresses)
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Return the array of addresses
      addresses: user.addresses || [],
      // Return wishlist (Fix for frontend)
      wishlist: user.wishlist || [],
      // Backward compatibility logic (Optional)
      address: user.addresses.find(a => a.isDefault)?.address || user.addresses[0]?.address || "",
      city: user.addresses.find(a => a.isDefault)?.city || user.addresses[0]?.city || "",
      postalCode: user.addresses.find(a => a.isDefault)?.postalCode || user.addresses[0]?.postalCode || "",
      country: user.addresses.find(a => a.isDefault)?.country || user.addresses[0]?.country || "",
      phone: user.addresses.find(a => a.isDefault)?.phone || user.addresses[0]?.phone || "",
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// 2. Update User Profile (Basic Info Only)
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      addresses: updatedUser.addresses,
      wishlist: updatedUser.wishlist, // consistent return
      token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : null,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// --- 3. NEW: Add Address ---
const addAddress = async (req, res) => {
  try {
    const { address, city, state, postalCode, country, phone, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      // If default, unset previous defaults
      if (isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }

      // If first address, auto-set as default
      const isFirst = user.addresses.length === 0;

      const newAddress = {
        address, city, state, postalCode, country, phone,
        isDefault: isDefault || isFirst
      };

      user.addresses.push(newAddress);
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- 4. NEW: Delete Address ---
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.addresses = user.addresses.filter(
        (addr) => addr._id.toString() !== req.params.id
      );
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Wishlist Functions (Existing) ---
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    if (user) {
      const alreadyAdded = user.wishlist.find(id => id.toString() === productId);
      if (alreadyAdded) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Added to wishlist' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.id);
      await user.save();
      res.json({ message: 'Removed from wishlist' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const setAddressAsDefault = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // 1. Set all to false
      user.addresses.forEach(addr => addr.isDefault = false);

      // 2. Find the specific address and set to true
      const targetAddr = user.addresses.find(addr => addr._id.toString() === req.params.id);
      if (targetAddr) {
        targetAddr.isDefault = true;
        await user.save();
        res.json(user.addresses);
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addAddress,      // NEW
  deleteAddress,   // NEW
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  setAddressAsDefault
};