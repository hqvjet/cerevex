from tensorflow.keras.layers import Input, Embedding, LSTM, Dropout, Dense, concatenate, Conv1D, MaxPooling1D, Flatten, Bidirectional, GlobalMaxPooling1D, Concatenate
from tensorflow.keras.models import Model

class HotelModel:
    def __init__(self, vocab_size=None, embedding_dim=100):
        self.vocab_size = vocab_size - 1
        self.num_filters = 128
        self.filter_sizes = [3, 4, 5]
        self.shape_1 = 128
        self.y_shape = 3
        self.embedding_dim = embedding_dim

    def build_model(self):
        # Input for title
        title_input = Input(shape=(self.shape_1,))
        title_embedding = Embedding(self.vocab_size, self.embedding_dim)(title_input)
        title_conv_blocks = []
        for filter_size in self.filter_sizes:
            title_conv = Conv1D(filters=self.num_filters, kernel_size=filter_size, activation='relu')(title_embedding)
            title_pool = MaxPooling1D(pool_size=self.shape_1 - filter_size + 1)(title_conv)
            title_conv_blocks.append(title_pool)
            title_concat = concatenate(title_conv_blocks, axis=-1)
            title_flat = Flatten()(title_concat)

        # Input for text
        text_input = Input(shape=(self.shape_1,))
        text_embedding = Embedding(self.vocab_size, self.embedding_dim)(text_input)
        text_conv_blocks = []
        for filter_size in self.filter_sizes:
            text_conv = Conv1D(filters=self.num_filters, kernel_size=filter_size, activation='relu')(text_embedding)
            text_pool = MaxPooling1D(pool_size=self.shape_1 - filter_size + 1)(text_conv)
            text_conv_blocks.append(text_pool)
        text_concat = concatenate(text_conv_blocks, axis=-1)
        text_flat = Flatten()(text_concat)

        # Combine the two inputs
        combined = concatenate([title_flat, text_flat])

        # Additional layers of the model
        dense1 = Dense(128, activation='relu')(combined)
        output = Dense(self.y_shape, activation='softmax')(dense1)

        # Build the model
        model_CNN = Model(inputs=[title_input, text_input], outputs=output)
        return model_CNN